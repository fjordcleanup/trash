import { isTest } from '@bifravst/aws-cdk-lambda-helpers/util'
import type { App } from 'aws-cdk-lib'
import { CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3'
import { PERSISTENCE_STACK_NAME } from './stackName.ts'

export class PersistenceStack extends Stack {
	public constructor(
		parent: App,
		{ baseDomainName }: { baseDomainName: string },
	) {
		super(parent, PERSISTENCE_STACK_NAME, {
			description: `The persistence layer.`,
		})

		const photoUploadBucket = new Bucket(this, 'photoUploadBucket', {
			autoDeleteObjects: isTest(this),
			removalPolicy: isTest(this)
				? RemovalPolicy.DESTROY
				: RemovalPolicy.RETAIN,
			publicReadAccess: false,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			cors: [
				{
					allowedOrigins: [
						'http://localhost:8080',
						`https://trash.${baseDomainName}`,
					],
					allowedMethods: [HttpMethods.PUT],
					allowedHeaders: ['Content-Type'],
				},
			],
		})

		new CfnOutput(this, 'photoUploadBucketName', {
			value: photoUploadBucket.bucketName,
			description: 'The name of the S3 bucket',
			exportName: `${Stack.of(this).stackName}:photoUploadBucketName`,
		})
	}
}

export type StackOutputs = { photoUploadBucketName: string }
