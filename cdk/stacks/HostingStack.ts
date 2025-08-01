import type { App, Environment } from 'aws-cdk-lib'
import {
	aws_cloudfront as Cf,
	CfnOutput,
	Duration,
	RemovalPolicy,
	aws_s3 as S3,
	Stack,
} from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { SSMParameterReader } from '../constructs/SSMParameterReader.ts'
import { AppCustomDomainCertificateStack } from './AppCustomDomainCertificateStack.ts'
import { HOSTING_STACK_NAME } from './stackName.ts'

export class HostingStack extends Stack {
	public constructor(
		parent: App,
		{
			baseDomainName,
			env,
		}: {
			baseDomainName: string
			env: Environment
		},
	) {
		super(parent, HOSTING_STACK_NAME, {
			env,
			description: `Hosting resources for the web app.`,
		})

		const websiteBucket = new S3.Bucket(this, 'bucket', {
			autoDeleteObjects: true,
			removalPolicy: RemovalPolicy.DESTROY,
			publicReadAccess: true,
			websiteIndexDocument: 'index.html',
			blockPublicAccess: {
				blockPublicAcls: false,
				ignorePublicAcls: false,
				restrictPublicBuckets: false,
				blockPublicPolicy: false,
			},
			objectOwnership: S3.ObjectOwnership.OBJECT_WRITER,
		})

		const defaultBehaviour: Cf.AddBehaviorOptions = {
			allowedMethods: Cf.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
			cachedMethods: Cf.CachedMethods.CACHE_GET_HEAD,
			compress: true,
			smoothStreaming: false,
			viewerProtocolPolicy: Cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			cachePolicy: new Cf.CachePolicy(this, 'defaultCachePolicy', {
				defaultTtl: Duration.minutes(10),
				enableAcceptEncodingBrotli: true,
				enableAcceptEncodingGzip: true,
			}),
		}

		const staticFileBehaviour: Cf.AddBehaviorOptions = {
			...defaultBehaviour,
			cachePolicy: new Cf.CachePolicy(this, 'staticFileBehaviour', {
				defaultTtl: Duration.days(356),
				minTtl: Duration.days(356),
				// Allow cache busting
				queryStringBehavior: Cf.CacheQueryStringBehavior.allowList('v'),
			}),
			edgeLambdas: [],
		}

		// Reference the certificate ARN from the custom domain certificate stack using a custom resource
		// This is necessary because the certificate must be in us-east-1 for CloudFront
		// and the hosting stack may be in a different region.
		// The certificate ARN is stored in an SSM parameter by the custom domain certificate stack
		// @see https://aws.amazon.com/blogs/infrastructure-and-automation/read-parameters-across-aws-regions-with-aws-cloudformation-custom-resources/
		const certificateArnReader = new SSMParameterReader(
			this,
			'CertificateARNReader',
			{
				parameterName: AppCustomDomainCertificateStack.parameterName(),
				region: 'us-east-1', // Certificates must be in us-east-1 for CloudFront
			},
		)

		const certificate = Certificate.fromCertificateArn(
			this,
			'appCertificate',
			certificateArnReader.getParameterValue(),
		)

		const s3Origin = S3BucketOrigin.withOriginAccessControl(websiteBucket)

		const domainName = `trash.${baseDomainName}`

		const distribution = new Cf.Distribution(this, 'cloudFront', {
			enabled: true,
			priceClass: Cf.PriceClass.PRICE_CLASS_100,
			defaultRootObject: 'index.html',
			defaultBehavior: {
				origin: s3Origin,
				...defaultBehaviour,
			},
			domainNames: [domainName],
			certificate,
		})
		distribution.addBehavior('*.js', s3Origin, staticFileBehaviour)
		distribution.addBehavior('*.map', s3Origin, staticFileBehaviour)
		distribution.addBehavior('*.css', s3Origin, staticFileBehaviour)
		distribution.addBehavior('*.webp', s3Origin, staticFileBehaviour)
		distribution.addBehavior('*.svg', s3Origin, staticFileBehaviour)
		distribution.addBehavior('*.png', s3Origin, staticFileBehaviour)
		distribution.addBehavior('*.woff2', s3Origin, staticFileBehaviour)

		// Add behavior for auth callback to serve index.html
		// This is necessary for single-page applications that handle routing client-side
		// and need to redirect all requests to index.html for the auth callback
		// This allows the app to handle the callback and redirect to the appropriate page
		// The callback URL is configured in the app's auth provider (e.g. Cognito)

		const redirectToIndexFn = new Cf.Function(this, 'redirectToIndexFn', {
			code: Cf.FunctionCode.fromInline(`
							function handler(event) {
								var request = event.request;
								request.uri = '/index.html';
								return request;
							}
						`),
		})

		const pathPatterns = ['/auth/callback', '/report/*', '/about']

		for (const pathPattern of pathPatterns) {
			distribution.addBehavior(pathPattern, s3Origin, {
				...defaultBehaviour,
				functionAssociations: [
					{
						function: redirectToIndexFn,
						eventType: Cf.FunctionEventType.VIEWER_REQUEST,
					},
				],
			})
		}

		// Create DNS A record for app subdomain pointing to CloudFront
		// on the hosted zone for the base domain
		const hostedZone = HostedZone.fromLookup(this, 'hostedZone', {
			domainName: baseDomainName,
		})
		new ARecord(this, 'appARecord', {
			zone: hostedZone,
			recordName: domainName,
			target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
		})

		new CfnOutput(this, 'distributionDomainName', {
			value: distribution.distributionDomainName,
			exportName: `${this.stackName}:distributionDomainName`,
		})

		new CfnOutput(this, 'distributionId', {
			value: distribution.distributionId,
			exportName: `${this.stackName}:distributionId`,
		})

		new CfnOutput(this, 'bucketName', {
			value: websiteBucket.bucketName,
			exportName: `${this.stackName}:bucketName`,
		})

		new CfnOutput(this, 'domainName', {
			value: domainName,
			exportName: `${this.stackName}:domainName`,
		})
	}
}

export type StackOutputs = {
	distributionDomainName: string
	bucketName: string
	distributionId: string
	domainName: string
}
