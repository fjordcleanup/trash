import { EventNames } from '#event/EventNames.ts'
import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import type { PersistenceLambdas } from 'cdk/lambdas/persistenceLambdas.ts'
import type { ReportAggregatesTableReference } from 'cdk/persistence/ReportAggregatesTableReference.ts'
import { Construct } from 'constructs'
import type { BaseLayerVersion } from '../lambdas/BaseLayerVersion.ts'
import type { EventsTableReference } from '../persistence/EventsTableReference.ts'

/**
 * Process cleanup events and update the respective trash report
 */
export class ProcessCleanup extends Construct {
	constructor(
		parent: Construct,
		{
			lambdaSources: { processCleanup },
			baseLayerVersion,
			eventsTable,
			reportAggregatesTable,
		}: {
			lambdaSources: Pick<PersistenceLambdas, 'processCleanup'>
			baseLayerVersion: BaseLayerVersion
			eventsTable: EventsTableReference
			reportAggregatesTable: ReportAggregatesTableReference
		},
	) {
		super(parent, ProcessCleanup.name)

		const processCleanupFn = new PackedLambdaFn(
			this,
			'processCleanup',
			processCleanup,
			{
				description: 'Process cleanup events',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					REPORT_AGGREGATES_TABLE_NAME: reportAggregatesTable.table.tableName,
				},
				events: [
					new DynamoEventSource(eventsTable.table, {
						startingPosition: StartingPosition.LATEST,
						filters: [
							{
								pattern: JSON.stringify({
									dynamodb: {
										NewImage: {
											eventName: {
												S: [EventNames.CleanupApproved],
											},
										},
									},
								}),
							},
						],
					}),
				],
			},
		)
		eventsTable.table.grantWriteData(processCleanupFn.fn)
		reportAggregatesTable.table.grantReadWriteData(processCleanupFn.fn)
	}
}
