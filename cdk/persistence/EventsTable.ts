import { isTest } from '@bifravst/aws-cdk-lambda-helpers/util'
import { RemovalPolicy, Stack } from 'aws-cdk-lib'
import {
	AttributeType,
	BillingMode,
	ProjectionType,
	StreamViewType,
	Table,
} from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import type { EventsTableReference } from './EventsTableReference.ts'

/**
 * Provides the DynamoDB table for storing the event sourcing events.
 */
export class EventsTable extends Construct implements EventsTableReference {
	public readonly table: Table
	public static readonly eventNameIndexName = 'eventNameIndex'
	public static readonly globalIndexNames = [EventsTable.eventNameIndexName]

	constructor(scope: Construct) {
		super(scope, EventsTable.name)

		this.table = new Table(this, 'eventsTable', {
			tableName: `${Stack.of(this).stackName}-eventsTable`,
			billingMode: BillingMode.PAY_PER_REQUEST,
			stream: StreamViewType.NEW_IMAGE,
			partitionKey: { name: 'aggregateId', type: AttributeType.STRING },
			sortKey: { name: 'eventId', type: AttributeType.STRING },
			pointInTimeRecoverySpecification: {
				pointInTimeRecoveryEnabled: !isTest(this),
			},
			removalPolicy: isTest(this)
				? RemovalPolicy.DESTROY
				: RemovalPolicy.RETAIN,
			deletionProtection: !isTest(this),
		})

		this.table.addGlobalSecondaryIndex({
			indexName: EventsTable.eventNameIndexName,
			partitionKey: { name: 'eventName', type: AttributeType.STRING },
			sortKey: { name: 'aggregateId', type: AttributeType.STRING },
			projectionType: ProjectionType.KEYS_ONLY,
		})
	}
}
