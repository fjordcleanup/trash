import {
	AdminGetUserCommand,
	CognitoIdentityProviderClient,
	ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { fromEnv } from '@bifravst/from-env'
import { extractEventsFromDynamoDBEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import type { SQSEvent } from 'aws-lambda'
import { findReportByIdDynamoDB } from '../../persistence/dynamoDB/findReportByIdDynamoDB.ts'

const { fromAddress, cognitoUserPoolId, reportAggregatesTableName } = fromEnv({
	fromAddress: 'FROM_ADDRESS',
	cognitoUserPoolId: 'COGNITO_USER_POOL_ID',
	reportAggregatesTableName: 'REPORT_AGGREGATES_TABLE_NAME',
})(process.env)

const ses = new SESClient({})
const cognito = new CognitoIdentityProviderClient({})
const db = new DynamoDBClient({})

const find = findReportByIdDynamoDB(db, reportAggregatesTableName)

export const handler = middy<SQSEvent>()
	.use(inputOutputLogger())
	.handler(async (event): Promise<void> => {
		const events = extractEventsFromDynamoDBEvent(event)

		for (const reportEvent of events) {
			const maybeReport = await find(reportEvent.aggregateId)

			if (maybeReport === null) {
				console.error(
					`Report with ID ${reportEvent.aggregateId} not found, skipping notification`,
				)
				continue
			}

			const sub = maybeReport.authorId.split(':').pop()!

			const { Users } = await cognito.send(
				new ListUsersCommand({
					UserPoolId: cognitoUserPoolId,
					Filter: `sub = "${sub}"`,
				}),
			)

			if ((Users?.length ?? 0) !== 1) {
				console.warn(`No user found for sub ${sub}, skipping notification`)
				continue
			}

			const userDetails = await cognito.send(
				new AdminGetUserCommand({
					UserPoolId: cognitoUserPoolId,
					Username: Users![0]!.Username!,
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
