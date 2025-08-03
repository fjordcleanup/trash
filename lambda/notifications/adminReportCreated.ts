import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { fromEnv } from '@bifravst/from-env'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import type { SQSEvent } from 'aws-lambda'
import type { ReportCreatedEvent } from '../../event/ReportCreatedEvent.ts'
import { extractEventsFromDynamoDBEvent } from '../../persistence/dynamoDB/extractEventsFromDynamoDBEvent.ts'
import { getAdminEmails } from './getAdminEmails.ts'

const { fromAddress, cognitoUserPoolId } = fromEnv({
	fromAddress: 'FROM_ADDRESS',
	cognitoUserPoolId: 'COGNITO_USER_POOL_ID',
})(process.env)

const ses = new SESClient({})
const cognito = new CognitoIdentityProviderClient({})
const adminEmails = await getAdminEmails({
	cognito,
	UserPoolId: cognitoUserPoolId,
})()

export const handler = middy<SQSEvent>()
	.use(inputOutputLogger())
	.handler(async (event): Promise<void> => {
		const events = extractEventsFromDynamoDBEvent(
			event,
		) as Array<ReportCreatedEvent>

		// Get admin email addresses
		if (adminEmails.length === 0) {
			console.warn('No admin emails found, skipping notification')
			return
		}

		for (const reportEvent of events) {
			await ses.send(
				new SendEmailCommand({
					Destination: {
						ToAddresses: adminEmails,
					},
					Message: {
						Body: {
							Text: {
								Data: [
									'A new trash report has been created!',
									`https://trash.fjordcleanup.org/map/${reportEvent.aggregateId}`,
								].join('\n'),
							},
						},
						Subject: {
							Data: `[Fjord CleanUP] › New trash report created: ${reportEvent.aggregateId}`,
						},
					},
					Source: fromAddress,
				}),
			)
		}
	})
