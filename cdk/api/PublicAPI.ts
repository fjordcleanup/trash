import type { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import { isTest } from '@bifravst/aws-cdk-lambda-helpers/util'
import type { aws_lambda as Lambda } from 'aws-cdk-lib'
import { Duration, aws_apigateway as RestApi } from 'aws-cdk-lib'
import type {
	CognitoUserPoolsAuthorizer,
	IntegrationOptions,
	IRestApi,
	MethodOptions,
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
	public readonly api: IRestApi
	private readonly corsMethods: Map<string, Set<string>> = new Map()

	constructor(
		parent: Construct,
		{
			baseDomainName,
		}: {
			baseDomainName: string
		},
	) {
		super(parent, PublicAPI.name)

		this.api = new RestApi.RestApi(this, 'api', {
			restApiName: 'Public API',
			endpointConfiguration: {
				types: [RestApi.EndpointType.REGIONAL],
			},
			deployOptions: {
				stageName: 'latest',
				// Caching
				cachingEnabled: !isTest(this),
				cacheClusterEnabled: !isTest(this),
				cacheClusterSize: !isTest(this) ? '0.5' : undefined,
				cacheTtl: !isTest(this) ? Duration.minutes(1) : undefined,
			},
		})

		const zone = HostedZone.fromLookup(this, 'zone', {
			domainName: baseDomainName,
		})

		const domainName = `api.${baseDomainName}`

		// Certificate for API domain
		const apiDomainCertificate = new Certificate(this, 'apiDomainCertificate', {
			domainName,
			validation: CertificateValidation.fromDns(zone),
		})

		const domain = new RestApi.DomainName(this, 'apiDomain', {
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
	}

	/**
	 * Adds CORS preflight responses for all resources that have been added with CORS methods.
	 * This should be called after all routes have been added.
	 */
	public addCORSPreflights(): void {
		for (const [resource, methods] of this.corsMethods.entries()) {
			this.api.root.resourceForPath(resource).addCorsPreflight({
				allowOrigins: RestApi.Cors.ALL_ORIGINS,
				allowMethods: Array.from(methods).map((m) => m.toUpperCase()),
				allowHeaders: [...RestApi.Cors.DEFAULT_HEADERS, 'If-Match', 'Accept'],
				exposeHeaders: ['ETag'],
			})
		}
	}

	public addRoute(
		methodAndRoute: string,
		{ fn }: PackedLambdaFn,
		authorizer?: CognitoUserPoolsAuthorizer,
		options?: RouteOptions,
	): {
		parsedResource: { method: string; resource: string }
		method: RestApi.Method
	} {
		const [method, resource] = methodAndRoute.split(' ', 2)
		if (!isMethod(method)) throw new Error(`${method} is not a HTTP method.`)
		if (resource === undefined) throw new Error(`Must provide a route`)
		if (!resource.startsWith('/'))
			throw new Error(`Route ${resource} must start with a slash!`)

		const resourceObj = this.api.root.resourceForPath(resource)

		// Caching options
		const integrationOptions: Writeable<RestApi.LambdaIntegrationOptions> = {
			proxy: true,
		}
		const methodOptions: Writeable<MethodOptions> = {}
		if (options?.cachingEnabled === true) {
			if (method !== 'GET')
				throw new Error(
					`Cache key parameters can only be used with GET methods.`,
				)
			if (options.cacheKeyParameters !== undefined) {
				integrationOptions.cacheKeyParameters = options.cacheKeyParameters
				methodOptions.requestParameters =
					options.cacheKeyParameters.reduce(
						(acc, param) => ({
							...acc,
							[param]: true,
						}),
						{},
					) ?? {}
			}
		}

		if (authorizer !== undefined) {
			methodOptions.authorizationType = RestApi.AuthorizationType.COGNITO
			methodOptions.authorizer = authorizer
		}

		const methodObj = resourceObj.addMethod(
			method,
			new RestApi.LambdaIntegration(fn, integrationOptions),
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

export type RouteOptions =
	| {
			cachingEnabled: true
			/**
			 * Specify cache key parameters for the integration.
			 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html#api-gateway-caching-parameters
			 * @example ['method.request.header.Authorization', 'method.request.querystring.param1', 'method.request.header.param2']
			 */
			cacheKeyParameters?: IntegrationOptions['cacheKeyParameters']
	  }
	| { cachingEnabled: false }

type Writeable<T> = { -readonly [K in keyof T]: T[K] }
