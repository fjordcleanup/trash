import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { fromEnv } from '@bifravst/from-env'
import { addCORSHeaders } from '@hello.nrfcloud.com/lambda-helpers/addCORSHeaders'
import { addVersionHeader } from '@hello.nrfcloud.com/lambda-helpers/addVersionHeader'
import { aResponse } from '@hello.nrfcloud.com/lambda-helpers/aResponse'
import { tryAsJSON } from '@hello.nrfcloud.com/lambda-helpers/tryAsJSON'
import { validateInput } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import { Type } from '@sinclair/typebox'
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { ulid } from 'ulidx'
import { TrashType } from '../src/api/TrashType.ts'
import type { AuthorizedEvent } from './authorizer/AuthorizedEvent.ts'
import type { CognitoClaims } from './authorizer/CognitoClaims.ts'
import { handleDomainErrors } from './middlewares/handleDomainErrors.ts'

const s3Client = new S3Client({})

const { version, photoUploadBucketName } = fromEnv({
	version: 'VERSION',
	photoUploadBucketName: 'PHOTO_UPLOAD_BUCKET_NAME',
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
		Type.String({ minLength: 1, title: 'Description' }),
	),
	numPhotos: Type.Integer({
		title: 'Number of Photos',
		minimum: 1,
		maximum: 2,
	}),
})

export const handler = middy<
	AuthorizedEvent<CognitoClaims>,
	APIGatewayProxyStructuredResultV2
>()
	.use(inputOutputLogger())
	.use(addVersionHeader(version))
	.use(addCORSHeaders())
	.use(validateInput(InputSchema, (event) => tryAsJSON(event.body)))
	.use(handleDomainErrors())
	.handler(async (event, context) => {
		// FIXME: persist report
		void context
		void event

		const id = ulid()

		return aResponse(
			201,
			{
				'@context': new URL('https://trash.fjordcleanup.org#context/report'),
				id,
				uploadURLs: await Promise.all(
					Array.from({
						length: context.decodedInput.numPhotos,
					}).map(async (_, index) =>
						getSignedUrl(
							s3Client,
							new PutObjectCommand({
								Bucket: photoUploadBucketName,
								Key: `${id}/photo-${index + 1}.original.jpeg`,
								ContentType: 'image/jpeg',
								Metadata: {
									userId: event.requestContext.authorizer.claims.sub,
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
