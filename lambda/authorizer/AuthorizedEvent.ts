import type { APIGatewayProxyEvent } from 'aws-lambda'

export type AuthorizedEvent<Context extends Record<string, unknown>> = Omit<
	APIGatewayProxyEvent,
	'requestContext'
> & {
	requestContext: Omit<APIGatewayProxyEvent['requestContext'], 'authorizer'> & {
		authorizer: Context
	}
}
