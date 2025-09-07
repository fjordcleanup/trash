import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import { App } from 'aws-cdk-lib'
import type { NotificationLambdas } from './lambdas/notificationLambdas.ts'
import type { PersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import type { UserLambdas } from './lambdas/userLambdas.ts'
import { AccountStack } from './stacks/AccountStack.ts'
import { PersistenceStack } from './stacks/PersistenceStack.ts'
import { PublicAPIStack } from './stacks/PublicAPIStack.ts'

export class FjordCleanUpTrashTestApp extends App {
	public constructor({
		baseLayerSource,
		lambdaSources,
		context,
	}: {
		lambdaSources: {
			user: UserLambdas
			persistence: PersistenceLambdas
			notifications: NotificationLambdas
		}
		baseLayerSource: PackedLayer
		context: Record<string, unknown> & { version: string }
	}) {
		super({
			context: {
				...context,
				isTest: true,
			},
		})

		const account = new AccountStack(this)

		const persistence = new PersistenceStack(this, {
			lambdaSources: lambdaSources.persistence,
			baseLayerSource,
		})

		const publicAPI = new PublicAPIStack(this, {
			baseLayerSource,
			lambdaSources: lambdaSources.user,
		})
		publicAPI.addDependency(account)
		publicAPI.addDependency(persistence)
	}
}
