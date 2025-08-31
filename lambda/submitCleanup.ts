import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { fromEnv } from '@bifravst/from-env'
import { ULIDSchema } from '@fjordcleanup/trash-proto'
import { addCORSHeaders } from '@hello.nrfcloud.com/lambda-helpers/addCORSHeaders'
import { addVersionHeader } from '@hello.nrfcloud.com/lambda-helpers/addVersionHeader'
import { aResponse } from '@hello.nrfcloud.com/lambda-helpers/aResponse'
import { validateInput } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import { Type } from '@sinclair/typebox'
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { findReportByIdDynamoDB } from 'persistence/dynamoDB/findReportByIdDynamoDB.ts'
import { createCleanupCommand } from '../command/createCleanupCommand.ts'
import { persistCleanupDynamoDB } from '../persistence/dynamoDB/persistCleanupDynamoDB.ts'
import { actorFromEvent } from './authorizer/actorFromEvent.ts'
import type { AuthorizedEvent } from './authorizer/AuthorizedEvent.ts'
import type { CognitoClaims } from './authorizer/CognitoClaims.ts'
import { handleDomainErrors } from './middlewares/handleDomainErrors.ts'

const s3Client = new S3Client({})
const db = new DynamoDBClient({})

const {
	version,
	photoUploadBucketName,
	cleanupAggregatesTableName,
	reportAggregatesTableName,
	eventsTableName,
} = fromEnv({
	version: 'VERSION',
	photoUploadBucketName: 'PHOTO_UPLOAD_BUCKET_NAME',
	cleanupAggregatesTableName: 'CLEANUP_AGGREGATES_TABLE_NAME',
	reportAggregatesTableName: 'REPORT_AGGREGATES_TABLE_NAME',
	eventsTableName: 'EVENTS_TABLE_NAME',
})(process.env)

const InputSchema = Type.Object({
	reportId: ULIDSchema,
	description: Type.String({
		minLength: 1,
		maxLength: 1000,
		title: 'Cleanup Description',
	}),
	numPhotos: Type.Optional(
		Type.Integer({
			title: 'Number of Photos',
			minimum: 0,
			maximum: 2,
			default: 0,
		}),
	),
})

const persist = persistCleanupDynamoDB(
	db,
	cleanupAggregatesTableName,
	eventsTableName,
)

const findReport = findReportByIdDynamoDB(db, reportAggregatesTableName)

const create = createCleanupCommand(persist, findReport)

export const handler = middy<
	AuthorizedEvent<CognitoClaims>,
	APIGatewayProxyStructuredResultV2
>()
	.use(inputOutputLogger())
	.use(addVersionHeader(version))
	.use(addCORSHeaders())
	.use(validateInput(InputSchema))
	.use(handleDomainErrors())
	.handler(async (event, context) => {
		const numPhotos = context.decodedInput.numPhotos ?? 0
		const photos =
			numPhotos > 0
				? Object.fromEntries(
						Array.from({ length: numPhotos }).map((_, index) => [
							`photo-${index + 1}.jpeg`,
							null,
						]),
					)
				: undefined

		const cleanup = await create(
			{
				reportId: context.decodedInput.reportId,
				description: context.decodedInput.description,
				photos,
			},
			actorFromEvent(event),
		)

		const uploadURLs =
			numPhotos > 0
				? await Promise.all(
						Object.keys(photos!).map(async (photo) =>
							getSignedUrl(
								s3Client,
								new PutObjectCommand({
									Bucket: photoUploadBucketName,
									Key: `cleanups/${cleanup.$meta.id}/${photo}`,
									ContentType: 'image/jpeg',
									Metadata: {
										actor: actorFromEvent(event),
										// key is lowercase in S3 metadata
										cleanupid: cleanup.$meta.id,
									},
								}),
								{ expiresIn: 60 * 5 },
							),
						),
					)
				: []

		return aResponse(
			201,
			{
				'@context': new URL('https://trash.fjordcleanup.org#context/cleanup'),
				...cleanup,
				uploadURLs,
			},
			0,
		)
	})
