import { fromEnv } from '@bifravst/from-env'
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
import type { APIGatewayProxyEventWithIAMIdentity } from './authorizer/APIGatewayProxyEventWithIAMIdentity.ts'
import { handleDomainErrors } from './middlewares/handleDomainErrors.ts'

const { version } = fromEnv({
	version: 'VERSION',
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
})

export const handler = middy<
	APIGatewayProxyEventWithIAMIdentity,
	APIGatewayProxyStructuredResultV2
>()
	.use(inputOutputLogger())
	.use(addVersionHeader(version))
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
				'@context': new URL('https://fjordcleanup.org/contexts/report'),
				id,
			},
			0,
			{
				// It should be possible read this resource from any origin
				'Access-Control-Allow-Origin': '*',
			},
		)
	})
