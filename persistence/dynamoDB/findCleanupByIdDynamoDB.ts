import { type DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { unmarshallAggregate } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import type { CleanupAggregate } from '../../aggregate/CleanupAggregate.ts'
import type { findCleanupByIdFn } from '../findCleanupByIdFn.ts'

export const findCleanupByIdDynamoDB =
	(db: DynamoDBClient, TableName: string): findCleanupByIdFn =>
	async (cleanupId) => {
		const { Item } = await db.send(
			new GetItemCommand({
				TableName,
				Key: marshall({
					aggregateId: cleanupId,
				}),
			}),
		)

		if (Item === undefined) return null
		return unmarshallAggregate(Item) as CleanupAggregate
	}
