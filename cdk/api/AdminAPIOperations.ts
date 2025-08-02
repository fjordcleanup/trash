import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import type { BaseLayerVersion } from '../lambdas/BaseLayerVersion.ts'
import type { UserLambdas } from '../lambdas/userLambdas.ts'
import { PersistenceStackEventsTable } from '../persistence/PersistenceStackEventsTable.ts'
import { PersistenceStackReportAggregatesTable } from '../persistence/PersistenceStackReportAggregatesTable.ts'
import type { PublicAPI } from './PublicAPI.ts'

export class AdminAPIOperations extends Construct {
	constructor(
		scope: Construct,
		{
			api,
			baseLayerVersion,
			lambdaSources: { deleteReport, listReports, publishReport },
			authorizer,
		}: {
			api: PublicAPI
			lambdaSources: Pick<
				UserLambdas,
				'deleteReport' | 'listReports' | 'publishReport'
			>
			baseLayerVersion: BaseLayerVersion
			authorizer: CognitoUserPoolsAuthorizer
		},
	) {
		super(scope, AdminAPIOperations.name)

		const reportAggregatesTable = new PersistenceStackReportAggregatesTable(
			this,
		)
		const eventsTable = new PersistenceStackEventsTable(this)

		// DELETE /sudo/report/{id}
		const deleteReportFn = new PackedLambdaFn(
			this,
			'deleteReport',
			deleteReport,
			{
				description: 'DELETE /sudo/report/{id}: Delete a trash report',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					REPORT_AGGREGATES_TABLE_NAME: reportAggregatesTable.table.tableName,
					EVENTS_TABLE_NAME: eventsTable.table.tableName,
				},
			},
		)
		api.addRoute('DELETE /sudo/report/{id}', deleteReportFn, authorizer)
		reportAggregatesTable.table.grantReadWriteData(deleteReportFn.fn)
		eventsTable.table.grantWriteData(deleteReportFn.fn)

		// PUT /sudo/report/{id}/publish
		const publishReportFn = new PackedLambdaFn(
			this,
			'publishReport',
			publishReport,
			{
				description: 'PUT /sudo/report/{id}/publish: Publish a trash report',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					REPORT_AGGREGATES_TABLE_NAME: reportAggregatesTable.table.tableName,
					EVENTS_TABLE_NAME: eventsTable.table.tableName,
				},
			},
		)
		api.addRoute('PUT /sudo/report/{id}/publish', publishReportFn, authorizer)
		reportAggregatesTable.table.grantReadWriteData(publishReportFn.fn)
		eventsTable.table.grantWriteData(publishReportFn.fn)

		// GET /sudo/reports
		const sudoListReportsFn = new PackedLambdaFn(
			this,
			'sudoListReports',
			listReports,
			{
				description: 'GET /sudo/reports: List all trash reports (admin)',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					REPORT_AGGREGATES_TABLE_NAME: reportAggregatesTable.table.tableName,
				},
			},
		)
		api.addRoute('GET /sudo/reports', sudoListReportsFn, authorizer)
		reportAggregatesTable.table.grantReadData(sudoListReportsFn.fn)
	}
}
