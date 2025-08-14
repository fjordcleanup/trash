import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { fromEnv } from '@bifravst/from-env'
import { TrashType } from '@fjordcleanup/trash-proto'
import { addCORSHeaders } from '@hello.nrfcloud.com/lambda-helpers/addCORSHeaders'
import { addVersionHeader } from '@hello.nrfcloud.com/lambda-helpers/addVersionHeader'
import { aResponse } from '@hello.nrfcloud.com/lambda-helpers/aResponse'
import { validateInput } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import { Type } from '@sinclair/typebox'
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { createReportCommand } from '../command/createReportCommand.ts'
import { persistReportDynamoDB } from '../persistence/dynamoDB/persistReportDynamoDB.ts'
import { actorFromEvent } from './authorizer/actorFromEvent.ts'
import type { AuthorizedEvent } from './authorizer/AuthorizedEvent.ts'
import type { CognitoClaims } from './authorizer/CognitoClaims.ts'
import { handleDomainErrors } from './middlewares/handleDomainErrors.ts'

const s3Client = new S3Client({})
const db = new DynamoDBClient({})

const {
	version,
	photoUploadBucketName,
	reportAggregatesTableName,
	eventsTableName,
} = fromEnv({
	version: 'VERSION',
	photoUploadBucketName: 'PHOTO_UPLOAD_BUCKET_NAME',
	reportAggregatesTableName: 'REPORT_AGGREGATES_TABLE_NAME',
	eventsTableName: 'EVENTS_TABLE_NAME',
})(process.env)

const InputSchema = Type.Object({
	type: Type.Array(Type.Enum(TrashType, { title: 'TrashType' }), {
		title: 'Trash Types',
		minItems: 1,
		allowEmpty: false,
	}),
	location: Type.Object({
		lat: Type.Number({ minimum: -90, maximum: 90, title: 'Latitude' }),
		lng: Type.Number({ minimum: -180, maximum: 180, title: 'Longitude' }),
	}),
	description: Type.Optional(
		Type.String({ minLength: 1, maxLength: 1000, title: 'Description' }),
	),
	numPhotos: Type.Integer({
		title: 'Number of Photos',
		minimum: 1,
		maximum: 2,
	}),
})

const persist = persistReportDynamoDB(
	db,
	reportAggregatesTableName,
	eventsTableName,
)

const create = createReportCommand(persist)

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
		const photos = Array.from({
			length: context.decodedInput.numPhotos,
		}).map((_, index) => `photo-${index + 1}.jpeg`)

		const report = await create(
			{
				type: context.decodedInput.type,
				location: context.decodedInput.location,
				description: context.decodedInput.description,
				photos: Object.fromEntries(photos.map((photo) => [photo, null])),
			},
			actorFromEvent(event),
		)

		return aResponse(
			201,
			{
				'@context': new URL('https://trash.fjordcleanup.org#context/report'),
				...report,
				uploadURLs: await Promise.all(
					photos.map(async (photo) =>
						getSignedUrl(
							s3Client,
							new PutObjectCommand({
								Bucket: photoUploadBucketName,
								Key: `${report.$meta.id}/${photo}`,
								ContentType: 'image/jpeg',
								Metadata: {
									actor: actorFromEvent(event),
									// key is lowercase in S3 metadata
									reportid: report.$meta.id,
								},
							}),
							{ expiresIn: 60 * 5 },
						),
					),
				),
			},
			0,
		)
	})
