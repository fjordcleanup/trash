import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@bifravst/from-env'
import { AggregateVersionSchema, ULIDSchema } from '@fjordcleanup/trash-proto'
import { addCORSHeaders } from '@hello.nrfcloud.com/lambda-helpers/addCORSHeaders'
import { addVersionHeader } from '@hello.nrfcloud.com/lambda-helpers/addVersionHeader'
import { aResponse } from '@hello.nrfcloud.com/lambda-helpers/aResponse'
import { parseHeaders } from '@hello.nrfcloud.com/lambda-helpers/parseHeaders'
import { validateInput } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import { Type } from '@sinclair/typebox'
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { publishReportCommand } from '../command/publishReportCommand.ts'
import { AccessDeniedError } from '../error/AccessDeniedError.ts'
import { findReportByIdDynamoDB } from '../persistence/dynamoDB/findReportByIdDynamoDB.ts'
import { persistReportEventDynamoDB } from '../persistence/dynamoDB/persistReportEventDynamoDB.ts'
import { actorFromEvent } from './authorizer/actorFromEvent.ts'
import type { AuthorizedEvent } from './authorizer/AuthorizedEvent.ts'
import type { CognitoClaims } from './authorizer/CognitoClaims.ts'
import { isAdmin } from './authorizer/isAdmin.ts'
import { handleDomainErrors } from './middlewares/handleDomainErrors.ts'

const db = new DynamoDBClient({})

const { version, reportAggregatesTableName, eventsTableName } = fromEnv({
	version: 'VERSION',
	reportAggregatesTableName: 'REPORT_AGGREGATES_TABLE_NAME',
	eventsTableName: 'EVENTS_TABLE_NAME',
})(process.env)

const InputSchema = Type.Object({
	id: ULIDSchema,
	version: AggregateVersionSchema,
})

const persist = persistReportEventDynamoDB(
	db,
	reportAggregatesTableName,
	eventsTableName,
)

const find = findReportByIdDynamoDB(db, reportAggregatesTableName)

const publish = publishReportCommand(find, persist)

export const handler = middy<
	AuthorizedEvent<CognitoClaims>,
	APIGatewayProxyStructuredResultV2
>()
	.use(inputOutputLogger())
	.use(addVersionHeader(version))
	.use(addCORSHeaders())
	.use(
		validateInput(InputSchema, (event) => ({
			id: event.pathParameters?.id,
			version: parseInt(parseHeaders(event.headers).get('if-match') ?? '0', 10),
		})),
	)
	.use(handleDomainErrors())
	.handler(async (event, context) => {
		if (!isAdmin(event))
			throw new AccessDeniedError(`Must be an admin to publish a report!`)

		const updated = await publish(
			context.decodedInput.id,
			context.decodedInput.version,
			actorFromEvent(event),
		)

		return aResponse(
			200,
			{
				'@context': new URL('https://trash.fjordcleanup.org#context/report'),
				...updated,
			},
			0,
			{
				Etag: updated.$meta.version.toString(),
			},
		)
	})
