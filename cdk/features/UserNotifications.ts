import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import { Stack } from 'aws-cdk-lib'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Construct } from 'constructs'
import { EventNames } from '../../event/EventNames.ts'
import type { BaseLayerVersion } from '../lambdas/BaseLayerVersion.ts'
import type { NotificationLambdas } from '../lambdas/notificationLambdas.ts'
import type { EventsTableReference } from '../persistence/EventsTableReference.ts'
import type { UserPoolReference } from '../persistence/UserPoolReference.ts'

export class UserNotifications extends Construct {
	constructor(
		parent: Construct,
		{
			lambdaSources: { userReportPublished },
			baseLayerVersion,
			baseDomainName,
			userPool,
			eventsTable,
		}: {
			lambdaSources: Pick<NotificationLambdas, 'userReportPublished'>
			baseLayerVersion: BaseLayerVersion
			baseDomainName: string
			userPool: UserPoolReference
			eventsTable: EventsTableReference
		},
	) {
		super(parent, UserNotifications.name)

		const fromAddress = `notifications@${baseDomainName}`
		const userReportPublishedFn = new PackedLambdaFn(
			this,
			'userReportPublished',
			userReportPublished,
			{
				description: 'Notify users when their report is published',
				layers: [baseLayerVersion.layerVersion],
				environment: {
					FROM_ADDRESS: fromAddress,
					COGNITO_USER_POOL_ID: userPool.userPool.userPoolId,
				},
				events: [
					new DynamoEventSource(eventsTable.table, {
						startingPosition: StartingPosition.LATEST,
						filters: [
							{
								pattern: JSON.stringify({
									dynamodb: {
										NewImage: {
											eventName: {
												S: [EventNames.ReportPublished],
											},
										},
									},
								}),
							},
						],
					}),
				],
				initialPolicy: [
					new PolicyStatement({
						actions: ['ses:SendEmail'],
						resources: [
							`arn:aws:ses:${Stack.of(this).region}:${
								Stack.of(this).account
							}:identity/${baseDomainName}`,
						],
						conditions: {
							StringLike: {
								'ses:FromAddress': fromAddress,
							},
						},
					}),
				],
			},
		)
		userPool.userPool.grant(userReportPublishedFn.fn, 'cognito-idp:UserGetUser')
	}
}
