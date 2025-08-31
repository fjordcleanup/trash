import { type DynamoDBClient } from '@aws-sdk/client-dynamodb'
import type { PersistFn } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import { persistDynamoDB } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import type { CleanupAggregate } from '../../aggregate/CleanupAggregate.ts'

export const persistCleanupDynamoDB = (
	db: DynamoDBClient,
	cleanupAggregatesTableName: string,
	eventsTableName: string,
): PersistFn<CleanupAggregate> =>
	persistDynamoDB(db, cleanupAggregatesTableName, eventsTableName)
