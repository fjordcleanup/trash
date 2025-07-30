import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway'
import type { IBucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import type { BaseLayerVersion } from '../lambdas/BaseLayerVersion.ts'
import type { UserLambdas } from '../lambdas/userLambdas.ts'
import type { PublicAPI } from './PublicAPI.ts'

export class PublicAPIOperations extends Construct {
	public readonly submitReportFn: PackedLambdaFn

	constructor(
		scope: Construct,
		{
			api,
			baseLayerVersion,
			lambdaSources: { submitReport },
			authorizer,
			photoUploadBucket,
		}: {
			api: PublicAPI
			lambdaSources: Pick<UserLambdas, 'submitReport'>
			baseLayerVersion: BaseLayerVersion
			authorizer: CognitoUserPoolsAuthorizer
			photoUploadBucket: IBucket
		},
	) {
		super(scope, PublicAPIOperations.name)

		// POST /2025-08-01/report
		this.submitReportFn = new PackedLambdaFn(
			this,
			'submitReport',
			submitReport,
			{
				description: 'POST /2025-08-01/report: Submit a new trash report',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					PHOTO_UPLOAD_BUCKET_NAME: photoUploadBucket.bucketName,
				},
			},
		)
		api.addRoute('POST /2025-08-01/report', this.submitReportFn, authorizer)
		photoUploadBucket.grantWrite(this.submitReportFn.fn)
	}
}
