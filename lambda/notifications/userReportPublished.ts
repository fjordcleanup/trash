import {
	AdminGetUserCommand,
	CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { fromEnv } from '@bifravst/from-env'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import type { SQSEvent } from 'aws-lambda'
import { extractEventsFromDynamoDBEvent } from '../../persistence/dynamoDB/extractEventsFromDynamoDBEvent.ts'

const { fromAddress, cognitoUserPoolId } = fromEnv({
	fromAddress: 'FROM_ADDRESS',
	cognitoUserPoolId: 'COGNITO_USER_POOL_ID',
})(process.env)

const ses = new SESClient({})
const cognito = new CognitoIdentityProviderClient({})

export const handler = middy<SQSEvent>()
	.use(inputOutputLogger())
	.handler(async (event): Promise<void> => {
		const events = extractEventsFromDynamoDBEvent(event)

		for (const reportEvent of events) {
			const userDetails = await cognito.send(
				new AdminGetUserCommand({
					UserPoolId: cognitoUserPoolId,
					Username: reportEvent.actorId.split(':')[1],
				}),
			)

			const email = userDetails.UserAttributes?.find(
				(attr) => attr.Name === 'email',
			)?.Value

			if (email === undefined) {
				console.error(
					`No email found for user ${reportEvent.actorId}, skipping notification`,
				)
				continue
			}

			await ses.send(
				new SendEmailCommand({
					Destination: {
						ToAddresses: [email],
					},
					Message: {
						Body: {
							Text: {
								Data: [
									'Wohoo!',
									'Your trash report was published!',
									`https://trash.fjordcleanup.org/map/${reportEvent.aggregateId}`,
									'Thank you for your contribution to keeping our fjords clean!',
								].join('\n'),
							},
						},
						Subject: {
							Data: `[Fjord CleanUP] › Trash report published: ${reportEvent.aggregateId}`,
						},
					},
					Source: fromAddress,
				}),
			)
		}
	})
