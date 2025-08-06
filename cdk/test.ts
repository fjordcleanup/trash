import { FjordCleanUpTrashTestApp } from './FjordCleanUpTrashTestApp.ts'
import { pack as packBaseLayer } from './lambdas/baseLayer.ts'
import { packLambdas as packNotificationLambdas } from './lambdas/notificationLambdas.ts'
import { packLambdas as packPersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import { packLambdas as packUserLambdas } from './lambdas/userLambdas.ts'

/**
 * This app is used for end-to-end testing and contains only the necessary
 * resources.
 */
new FjordCleanUpTrashTestApp({
	lambdaSources: {
		user: await packUserLambdas(),
		persistence: await packPersistenceLambdas(),
		notifications: await packNotificationLambdas(),
	},
	baseLayerSource: await packBaseLayer(),
})
