import { type DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import type { findReportByIdFn } from '../findReportByIdFn.ts'
import { unmarshallAggregate } from './unmarshallAggregate.ts'

export const findReportByIdDynamoDB =
	(db: DynamoDBClient, TableName: string): findReportByIdFn =>
	async (reportId) => {
		const { Item } = await db.send(
			new GetItemCommand({
				TableName,
				Key: marshall({
					aggregateId: reportId,
				}),
			}),
		)

		if (Item === undefined) return null
		return unmarshallAggregate(Item) as ReportAggregate
	}
