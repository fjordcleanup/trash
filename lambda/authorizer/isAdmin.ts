import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import type { AuthorizedEvent } from './AuthorizedEvent.ts'
import type { CognitoClaims } from './CognitoClaims.ts'

export const isAdmin = (
	event: APIGatewayProxyEventV2 | AuthorizedEvent<CognitoClaims>,
): boolean => {
	if (!('authorizer' in event.requestContext)) {
		return false
	}
	return event.requestContext.authorizer.claims['cognito:groups']?.includes(
		'admins',
	)
}
