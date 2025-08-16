import path from 'node:path'
import { FjordCleanUpTrashTestApp } from './FjordCleanUpTrashTestApp.ts'
import { pack as packBaseLayer } from './lambdas/baseLayer.ts'
import { packLambdas as packNotificationLambdas } from './lambdas/notificationLambdas.ts'
import { packLambdas as packPersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import { packLambdas as packUserLambdas } from './lambdas/userLambdas.ts'

const tsConfigFilePath = path.join(process.cwd(), 'tsconfig.json')

/**
 * This app is used for end-to-end testing and contains only the necessary
 * resources.
 */
new FjordCleanUpTrashTestApp({
	lambdaSources: {
		user: await packUserLambdas(tsConfigFilePath),
		persistence: await packPersistenceLambdas(tsConfigFilePath),
		notifications: await packNotificationLambdas(tsConfigFilePath),
	},
	baseLayerSource: await packBaseLayer(),
	version: process.env.VERSION ?? '0.0.0-development',
})
