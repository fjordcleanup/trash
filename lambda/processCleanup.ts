import type { CleanupApprovedEvent } from '#event/CleanupApprovedEvent.ts'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@bifravst/from-env'
import { extractEventsFromDynamoDBEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import type { SQSEvent } from 'aws-lambda'
import { reportReducer } from '../aggregate/reducer/reportReducer.ts'
import { findReportByIdDynamoDB } from '../persistence/dynamoDB/findReportByIdDynamoDB.ts'
import { persistReportDynamoDB } from '../persistence/dynamoDB/persistReportDynamoDB.ts'

const { reportAggregatesTableName } = fromEnv({
	fromAddress: 'FROM_ADDRESS',
	reportAggregatesTableName: 'REPORT_AGGREGATES_TABLE_NAME',
})(process.env)

const db = new DynamoDBClient()
const find = findReportByIdDynamoDB(db, reportAggregatesTableName)
const persist = persistReportDynamoDB(db, reportAggregatesTableName)

export const handler = middy<SQSEvent>()
	.use(inputOutputLogger())
	.handler(async (event): Promise<void> => {
		const events = extractEventsFromDynamoDBEvent<CleanupApprovedEvent>(event)

		for (const event of events) {
			const maybeReport = await find(event.aggregateId)
			if (maybeReport === null) {
				console.error(`Report not found for aggregateId: ${event.aggregateId}`)
				continue
			}

			const applied = reportReducer([event], maybeReport)

			await persist(applied)

			console.log(JSON.stringify({ applied }))
		}
	})
