import { type DynamoDBClient } from '@aws-sdk/client-dynamodb'
import type { PersistAggregateFn } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import { persistAggregateDynamoDB } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import type { ReportAggregate } from '../../aggregate/ReportAggregate.ts'

export const persistReportDynamoDB = (
	db: DynamoDBClient,
	reportAggregatesTableName: string,
): PersistAggregateFn<ReportAggregate> =>
	persistAggregateDynamoDB(db, reportAggregatesTableName)
