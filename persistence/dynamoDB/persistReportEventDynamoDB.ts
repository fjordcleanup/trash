import { type DynamoDBClient } from '@aws-sdk/client-dynamodb'
import type { PersistFn } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import { persistDynamoDB } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import type { ReportAggregate } from '../../aggregate/ReportAggregate.ts'

export const persistReportEventDynamoDB = (
	db: DynamoDBClient,
	reportAggregatesTableName: string,
	eventsTableName: string,
): PersistFn<ReportAggregate> =>
	persistDynamoDB(db, reportAggregatesTableName, eventsTableName)
