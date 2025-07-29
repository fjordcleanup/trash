import type { APIGatewayProxyEvent } from 'aws-lambda'

export type APIGatewayProxyEventWithIAMIdentity = APIGatewayProxyEvent & {
	requestContext: {
		identity: {
			userArn: string // e.g. 'arn:aws:iam::123456789012:user/alex'
		}
	}
}
