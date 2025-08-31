import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway'
import type { IBucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import type { BaseLayerVersion } from '../lambdas/BaseLayerVersion.ts'
import type { UserLambdas } from '../lambdas/userLambdas.ts'
import { PersistenceStackCleanupAggregatesTable } from '../persistence/PersistenceStackCleanupAggregatesTable.ts'
import { PersistenceStackEventsTable } from '../persistence/PersistenceStackEventsTable.ts'
import { PersistenceStackReportAggregatesTable } from '../persistence/PersistenceStackReportAggregatesTable.ts'
import type { PublicAPI } from './PublicAPI.ts'

export class PublicAPIOperations extends Construct {
	constructor(
		scope: Construct,
		{
			api,
			baseLayerVersion,
			lambdaSources: { submitReport, listReports, submitCleanup },
			authorizer,
			photoUploadBucket,
		}: {
			api: PublicAPI
			lambdaSources: Pick<
				UserLambdas,
				'submitReport' | 'listReports' | 'submitCleanup'
			>
			baseLayerVersion: BaseLayerVersion
			authorizer: CognitoUserPoolsAuthorizer
			photoUploadBucket: IBucket
		},
	) {
		super(scope, PublicAPIOperations.name)

		const reportAggregatesTable = new PersistenceStackReportAggregatesTable(
			this,
		)
		const cleanupAggregatesTable = new PersistenceStackCleanupAggregatesTable(
			this,
		)
		const eventsTable = new PersistenceStackEventsTable(this)

		// POST /report
		const submitReportFn = new PackedLambdaFn(
			this,
			'submitReport',
			submitReport,
			{
				description: 'POST /report: Submit a new trash report',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					PHOTO_UPLOAD_BUCKET_NAME: photoUploadBucket.bucketName,
					REPORT_AGGREGATES_TABLE_NAME: reportAggregatesTable.table.tableName,
					EVENTS_TABLE_NAME: eventsTable.table.tableName,
				},
			},
		)
		api.addRoute('POST /report', submitReportFn, authorizer)
		photoUploadBucket.grantWrite(submitReportFn.fn)
		reportAggregatesTable.table.grantWriteData(submitReportFn.fn)
		eventsTable.table.grantWriteData(submitReportFn.fn)

		// POST /cleanup
		const submitCleanupFn = new PackedLambdaFn(
			this,
			'submitCleanup',
			submitCleanup,
			{
				description: 'POST /cleanup: Submit a new cleanup report',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					PHOTO_UPLOAD_BUCKET_NAME: photoUploadBucket.bucketName,
					CLEANUP_AGGREGATES_TABLE_NAME: cleanupAggregatesTable.table.tableName,
					EVENTS_TABLE_NAME: eventsTable.table.tableName,
					REPORT_AGGREGATES_TABLE_NAME: reportAggregatesTable.table.tableName,
				},
			},
		)
		api.addRoute('POST /cleanup', submitCleanupFn, authorizer)
		photoUploadBucket.grantWrite(submitCleanupFn.fn)
		cleanupAggregatesTable.table.grantWriteData(submitCleanupFn.fn)
		eventsTable.table.grantWriteData(submitCleanupFn.fn)
		reportAggregatesTable.table.grantReadData(submitCleanupFn.fn)

		// GET /reports
		const listReportsFn = new PackedLambdaFn(this, 'listReports', listReports, {
			description: 'GET /reports: List all trash reports (public)',
			layers: [baseLayerVersion.layerVersion],
			environment: {
				REPORT_AGGREGATES_TABLE_NAME: reportAggregatesTable.table.tableName,
			},
		})
		api.addRoute('GET /reports', listReportsFn)
		reportAggregatesTable.table.grantReadData(listReportsFn.fn)
	}
}
