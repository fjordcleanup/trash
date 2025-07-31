import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import { isTest } from '@bifravst/aws-cdk-lambda-helpers/util'
import type { App } from 'aws-cdk-lib'
import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { Architecture, LayerVersion } from 'aws-cdk-lib/aws-lambda'
import { S3EventSourceV2 } from 'aws-cdk-lib/aws-lambda-event-sources'
import {
	BlockPublicAccess,
	Bucket,
	EventType,
	HttpMethods,
	ObjectOwnership,
} from 'aws-cdk-lib/aws-s3'
import { BaseLayerVersion } from './lambdas/BaseLayerVersion.ts'
import type { PersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import { EventsTable } from './persistence/EventsTable.ts'
import { ReportAggregatesTable } from './persistence/ReportAggregatesTable.ts'
import { PERSISTENCE_STACK_NAME } from './stackName.ts'

export class PersistenceStack extends Stack {
	public constructor(
		parent: App,
		{
			baseDomainName,
			lambdaSources,
			baseLayerSource,
		}: {
			baseDomainName: string
			lambdaSources: PersistenceLambdas
			baseLayerSource: PackedLayer
		},
	) {
		super(parent, PERSISTENCE_STACK_NAME, {
			description: `Contains resources that persist data and cannot be deleted without data loss.`,
		})

		const reportAggregatesTable = new ReportAggregatesTable(this)
		new CfnOutput(this, 'reportAggregatesTableName', {
			value: reportAggregatesTable.table.tableName,
			description: 'The name of the report aggregates table',
			exportName: `${Stack.of(this).stackName}:reportAggregatesTableName`,
		})

		const eventsTable = new EventsTable(this)
		new CfnOutput(this, 'eventsTableName', {
			value: eventsTable.table.tableName,
			description: 'The name of the events table',
			exportName: `${Stack.of(this).stackName}:eventsTableName`,
		})

		// This bucket receives the original photos uploaded by users
		// It is not public, but it has CORS enabled for PUT requests from the frontend
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

		// This bucket stores the resized images
		const resizedBucket = new Bucket(this, 'resizedBucket', {
			publicReadAccess: true,
			removalPolicy: RemovalPolicy.DESTROY,
			blockPublicAccess: {
				blockPublicAcls: false,
				ignorePublicAcls: false,
				restrictPublicBuckets: false,
				blockPublicPolicy: false,
			},
			objectOwnership: ObjectOwnership.OBJECT_WRITER,
		})

		new CfnOutput(this, 'resizedBucketName', {
			value: resizedBucket.bucketName,
			description: 'The name of the S3 bucket',
			exportName: `${Stack.of(this).stackName}:resizedBucketName`,
		})

		const baseLayerVersion = new BaseLayerVersion(this, baseLayerSource)
		const imageMagickLayerVersion = LayerVersion.fromLayerVersionArn(
			this,
			'imageMagickLayer',
			`arn:aws:lambda:${Stack.of(this).region}:${Stack.of(this).account}:layer:image-magick:1`,
		)

		const resizePhotosFn = new PackedLambdaFn(
			this,
			'resizePhotos',
			lambdaSources.resizePhotos,
			{
				// Required for ImageMagick to work
				architecture: Architecture.X86_64,
				description: 'Resize photos uploaded by users',
				layers: [baseLayerVersion.layerVersion, imageMagickLayerVersion],
				environment: {
					RESIZED_BUCKET_NAME: resizedBucket.bucketName,
				},
				timeout: Duration.seconds(60),
				events: [
					new S3EventSourceV2(photoUploadBucket, {
						events: [EventType.OBJECT_CREATED_PUT],
					}),
				],
			},
		)
		photoUploadBucket.grantRead(resizePhotosFn.fn)
		resizedBucket.grantReadWrite(resizePhotosFn.fn)
	}
}

export type StackOutputs = {
	photoUploadBucketName: string
	resizedBucketName: string
	reportAggregatesTableName: string
	eventsTableName: string
}
