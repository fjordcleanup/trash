import type { APIGatewayProxyEventV2 } from 'aws-lambda'

export type AuthorizedEvent<Context extends Record<string, unknown>> = Omit<
	APIGatewayProxyEventV2,
	'requestContext'
> & {
	requestContext: Omit<
		APIGatewayProxyEventV2['requestContext'],
		'authorizer'
	> & {
		authorizer: Context
	}
}
