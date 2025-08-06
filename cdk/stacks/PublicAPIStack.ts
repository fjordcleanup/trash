import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import type { App, Environment } from 'aws-cdk-lib'
import { CfnOutput, Duration, Fn, Stack } from 'aws-cdk-lib'
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { AdminAPIOperations } from '../api/AdminAPIOperations.ts'
import { PublicAPI } from '../api/PublicAPI.ts'
import { PublicAPIOperations } from '../api/PublicAPIOperations.ts'
import { BaseLayerVersion } from '../lambdas/BaseLayerVersion.ts'
import type { UserLambdas } from '../lambdas/userLambdas.ts'
import { AccountStackUserPool } from '../persistence/AccountStackUserPool.ts'
import { PERSISTENCE_STACK_NAME, PUBLIC_API_STACK_NAME } from './stackName.ts'

export class PublicAPIStack extends Stack {
	public constructor(
		parent: App,
		{
			env,
			baseDomainName,
			baseLayerSource,
			lambdaSources,
		}: {
			env?: Environment
			baseDomainName?: string
			lambdaSources: UserLambdas
			baseLayerSource: PackedLayer
		},
	) {
		super(parent, PUBLIC_API_STACK_NAME, {
			env,
			description: `The public API.`,
		})

		const api = new PublicAPI(this, {
			baseDomainName,
		})

		new CfnOutput(this, 'apiURL', {
			value: api.url,
			description: 'The URL of the REST API',
		})

		const userPool = new AccountStackUserPool(this)

		const authorizer = new CognitoUserPoolsAuthorizer(this, 'authorizer', {
			cognitoUserPools: [userPool.userPool],
			resultsCacheTtl: Duration.minutes(15),
			authorizerName: 'CognitoUsers',
		})

		const baseLayerVersion = new BaseLayerVersion(this, baseLayerSource)

		const photoUploadBucket = Bucket.fromBucketName(
			this,
			'photoUploadBucket',
			Fn.importValue(`${PERSISTENCE_STACK_NAME}:photoUploadBucketName`),
		)

		new PublicAPIOperations(this, {
			api,
			lambdaSources,
			authorizer,
			baseLayerVersion,
			photoUploadBucket,
		})

		new AdminAPIOperations(this, {
			api,
			lambdaSources,
			authorizer,
			baseLayerVersion,
		})

		api.addCORSPreflights()
	}
}

export type StackOutputs = { apiURL: string }
