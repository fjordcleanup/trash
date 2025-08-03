import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import type { App } from 'aws-cdk-lib'
import { Stack } from 'aws-cdk-lib'
import { AdminNotifications } from '../features/AdminNotifications.ts'
import { BaseLayerVersion } from '../lambdas/BaseLayerVersion.ts'
import type { NotificationLambdas } from '../lambdas/notificationLambdas.ts'
import { AccountStackUserPool } from '../persistence/AccountStackUserPool.ts'
import { PersistenceStackEventsTable } from '../persistence/PersistenceStackEventsTable.ts'
import { NOTIFICATIONS_STACK_NAME } from './stackName.ts'

export class NotificationsStack extends Stack {
	public constructor(
		parent: App,
		{
			baseDomainName,
			baseLayerSource,
			lambdaSources,
		}: {
			baseDomainName: string
			lambdaSources: NotificationLambdas
			baseLayerSource: PackedLayer
		},
	) {
		super(parent, NOTIFICATIONS_STACK_NAME, {
			description: `Sends out notifications.`,
		})

		const baseLayerVersion = new BaseLayerVersion(this, baseLayerSource)

		const userPool = new AccountStackUserPool(this)

		const eventsTable = new PersistenceStackEventsTable(this)

		new AdminNotifications(this, {
			lambdaSources,
			baseLayerVersion,
			baseDomainName,
			userPool,
			eventsTable,
		})
	}
}

export type StackOutputs = { apiURL: string }
