import { TrashType } from '#domain/TrashType.ts'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@bifravst/from-env'
import { addCORSHeaders } from '@hello.nrfcloud.com/lambda-helpers/addCORSHeaders'
import { addVersionHeader } from '@hello.nrfcloud.com/lambda-helpers/addVersionHeader'
import { aResponse } from '@hello.nrfcloud.com/lambda-helpers/aResponse'
import { validateInput } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import { Type } from '@sinclair/typebox'
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { listReportsDynamoDB } from '../persistence/dynamoDB/listReportsDynamoDB.ts'
import type { AuthorizedEvent } from './authorizer/AuthorizedEvent.ts'
import type { CognitoClaims } from './authorizer/CognitoClaims.ts'
import { isAdmin } from './authorizer/isAdmin.ts'
import { handleDomainErrors } from './middlewares/handleDomainErrors.ts'

const db = new DynamoDBClient({})

const { version, reportAggregatesTableName } = fromEnv({
	version: 'VERSION',
	reportAggregatesTableName: 'REPORT_AGGREGATES_TABLE_NAME',
})(process.env)

const InputSchema = Type.Object({
	type: Type.Optional(
		Type.Array(Type.Enum(TrashType, { title: 'TrashType' }), {
			title: 'Trash Types',
			minItems: 1,
			allowEmpty: false,
		}),
	),
})

const list = listReportsDynamoDB(db, reportAggregatesTableName)

export const handler = middy<
	AuthorizedEvent<CognitoClaims>,
	APIGatewayProxyStructuredResultV2
>()
	.use(inputOutputLogger())
	.use(addVersionHeader(version))
	.use(addCORSHeaders())
	.use(validateInput(InputSchema))
	.use(handleDomainErrors())
	.handler(async (event) => {
		const admin = isAdmin(event)
		const reports = (await list()).filter(
			(report) =>
				(admin || report.isPublic === true) && report.isDeleted !== true,
		)

		return aResponse(
			200,
			{
				'@context': new URL('https://trash.fjordcleanup.org#context/page'),
				'@item-context': new URL(
					'https://trash.fjordcleanup.org#context/report',
				),
				items: reports,
			},
			60,
		)
	})
