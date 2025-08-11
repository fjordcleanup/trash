import type { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { aws_lambda as Lambda } from 'aws-cdk-lib'
import {
	AuthorizationType,
	type CognitoUserPoolsAuthorizer,
	Cors,
	DomainName,
	EndpointType,
	LambdaIntegration,
	type LambdaIntegrationOptions,
	type Method,
	type MethodOptions,
	RestApi,
} from 'aws-cdk-lib/aws-apigateway'
import {
	Certificate,
	CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'

export class PublicAPI extends Construct {
	public readonly url: string
	public readonly api: RestApi
	private readonly corsMethods: Map<string, Set<string>> = new Map()

	constructor(
		parent: Construct,
		{
			baseDomainName,
		}: {
			baseDomainName?: string
		},
	) {
		super(parent, PublicAPI.name)

		this.api = new RestApi(this, 'api', {
			restApiName: 'Public API',
			endpointConfiguration: {
				types: [EndpointType.REGIONAL],
			},
			deployOptions: {
				stageName: 'latest',
			},
		})

		if (baseDomainName !== undefined) {
			const zone = HostedZone.fromLookup(this, 'zone', {
				domainName: baseDomainName,
			})

			const domainName = `api.${baseDomainName}`
			// Certificate for API domain
			const apiDomainCertificate = new Certificate(
				this,
				'apiDomainCertificate',
				{
					domainName,
					validation: CertificateValidation.fromDns(zone),
				},
			)

			const domain = new DomainName(this, 'apiDomain', {
				domainName,
				certificate: apiDomainCertificate,
			})
			domain.addBasePathMapping(this.api, { stage: this.api.deploymentStage })

			this.url = `https://${domainName}/`

			new ARecord(this, 'apiDomainAliasRecord', {
				zone,
				target: RecordTarget.fromAlias(
					new ApiGatewayv2DomainProperties(
						domain.domainNameAliasDomainName,
						domain.domainNameAliasHostedZoneId,
					),
				),
				recordName: domainName,
			})
		} else {
			this.url = this.api.url
		}
	}

	/**
	 * Adds CORS preflight responses for all resources that have been added with CORS methods.
	 * This should be called after all routes have been added.
	 */
	public addCORSPreflights(): void {
		for (const [resource, methods] of this.corsMethods.entries()) {
			this.api.root.resourceForPath(resource).addCorsPreflight({
				allowOrigins: Cors.ALL_ORIGINS,
				allowMethods: Array.from(methods).map((m) => m.toUpperCase()),
				allowHeaders: [...Cors.DEFAULT_HEADERS, 'If-Match', 'Accept'],
				exposeHeaders: ['ETag'],
			})
		}
	}

	public addRoute(
		methodAndRoute: string,
		{ fn }: PackedLambdaFn,
		authorizer?: CognitoUserPoolsAuthorizer,
	): {
		parsedResource: { method: string; resource: string }
		method: Method
	} {
		const [method, resource] = methodAndRoute.split(' ', 2)
		if (!isMethod(method)) throw new Error(`${method} is not a HTTP method.`)
		if (resource === undefined) throw new Error(`Must provide a route`)
		if (!resource.startsWith('/'))
			throw new Error(`Route ${resource} must start with a slash!`)

		const resourceObj = this.api.root.resourceForPath(resource)

		// Caching options
		const integrationOptions: Writeable<LambdaIntegrationOptions> = {
			proxy: true,
		}
		const methodOptions: Writeable<MethodOptions> = {}

		if (authorizer !== undefined) {
			methodOptions.authorizationType = AuthorizationType.COGNITO
			methodOptions.authorizer = authorizer
		}

		const methodObj = resourceObj.addMethod(
			method,
			new LambdaIntegration(fn, integrationOptions),
			methodOptions,
		)

		if (!this.corsMethods.has(resource)) {
			this.corsMethods.set(resource, new Set<string>())
		}
		this.corsMethods.get(resource)!.add(method)

		return { parsedResource: { method, resource }, method: methodObj }
	}
}

const isMethod = (method?: string): method is Lambda.HttpMethod =>
	['GET', 'PUT', 'HEAD', 'POST', 'DELETE', 'PATCH'].includes(method ?? '')

type Writeable<T> = { -readonly [K in keyof T]: T[K] }
