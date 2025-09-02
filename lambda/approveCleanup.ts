import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@bifravst/from-env'
import { AggregateVersionSchema, ULIDSchema } from '@fjordcleanup/trash-proto'
import { addCORSHeaders } from '@hello.nrfcloud.com/lambda-helpers/addCORSHeaders'
import { addVersionHeader } from '@hello.nrfcloud.com/lambda-helpers/addVersionHeader'
import { aResponse } from '@hello.nrfcloud.com/lambda-helpers/aResponse'
import { parseHeaders } from '@hello.nrfcloud.com/lambda-helpers/parseHeaders'
import { tryAsJSON } from '@hello.nrfcloud.com/lambda-helpers/tryAsJSON'
import { validateInput } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import { Type } from '@sinclair/typebox'
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { approveCleanupCommand } from '../command/approveCleanupCommand.ts'
import { rejectCleanupCommand } from '../command/rejectCleanupCommand.ts'
import { AccessDeniedError } from '../error/AccessDeniedError.ts'
import { findCleanupByIdDynamoDB } from '../persistence/dynamoDB/findCleanupByIdDynamoDB.ts'
import { persistCleanupDynamoDB } from '../persistence/dynamoDB/persistCleanupDynamoDB.ts'
import { actorFromEvent } from './authorizer/actorFromEvent.ts'
import type { AuthorizedEvent } from './authorizer/AuthorizedEvent.ts'
import type { CognitoClaims } from './authorizer/CognitoClaims.ts'
import { isAdmin } from './authorizer/isAdmin.ts'
import { handleDomainErrors } from './middlewares/handleDomainErrors.ts'

const db = new DynamoDBClient({})

const { version, cleanupAggregatesTableName, eventsTableName } = fromEnv({
	version: 'VERSION',
	cleanupAggregatesTableName: 'CLEANUP_AGGREGATES_TABLE_NAME',
	eventsTableName: 'EVENTS_TABLE_NAME',
})(process.env)

const InputSchema = Type.Object({
	id: ULIDSchema,
	version: AggregateVersionSchema,
	approve: Type.Boolean(),
})

const persist = persistCleanupDynamoDB(
	db,
	cleanupAggregatesTableName,
	eventsTableName,
)

const find = findCleanupByIdDynamoDB(db, cleanupAggregatesTableName)

const approve = approveCleanupCommand(find, persist)
const reject = rejectCleanupCommand(find, persist)

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
			approve: tryAsJSON(event.body)?.approve,
		})),
	)
	.use(handleDomainErrors())
	.handler(async (event, context) => {
		if (!isAdmin(event))
			throw new AccessDeniedError(`Must be an admin to approve a cleanup!`)

		const updated = await (context.decodedInput.approve ? approve : reject)(
			context.decodedInput.id,
			context.decodedInput.version,
			actorFromEvent(event),
		)

		return aResponse(
			200,
			{
				'@context': new URL('https://trash.fjordcleanup.org#context/cleanup'),
				...updated,
			},
			0,
			{
				Etag: updated.$meta.version.toString(),
			},
		)
	})
