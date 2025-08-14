import { type DynamoDBClient, paginateScan } from '@aws-sdk/client-dynamodb'
import { unmarshallAggregate } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import type { ReportAggregate } from '../../aggregate/ReportAggregate.ts'
import type { listReportsFn } from '../listReportsFn.ts'

export const listReportsDynamoDB =
	(db: DynamoDBClient, TableName: string): listReportsFn =>
	async () => {
		const reports: Array<ReportAggregate> = []

		for await (const page of paginateScan(
			{
				client: db,
			},
			{
				TableName,
			},
		)) {
			for (const item of page.Items ?? []) {
				reports.push(unmarshallAggregate(item) as ReportAggregate)
			}
		}
		return reports
	}
