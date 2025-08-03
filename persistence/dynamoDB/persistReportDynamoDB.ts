import { type DynamoDBClient } from '@aws-sdk/client-dynamodb'
import type { ReportAggregate } from '../../aggregate/ReportAggregate.ts'
import type { PersistFn } from '../PersistFn.ts'
import { persistDynamoDB } from './persistDynamoDB.ts'

export const persistReportDynamoDB = (
	db: DynamoDBClient,
	reportAggregatesTableName: string,
	eventsTableName: string,
): PersistFn<ReportAggregate> =>
	persistDynamoDB(db, reportAggregatesTableName, eventsTableName)
