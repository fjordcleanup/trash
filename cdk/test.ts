import {
	DiffMethod,
	MemoryContext,
	StackSelectionStrategy,
	Toolkit,
} from '@aws-cdk/toolkit-lib'
import commandLineArgs from 'command-line-args'
import path from 'node:path'
import { FjordCleanUpTrashTestApp } from './FjordCleanUpTrashTestApp.ts'
import { pack as packBaseLayer } from './lambdas/baseLayer.ts'
import { packLambdas as packNotificationLambdas } from './lambdas/notificationLambdas.ts'
import { packLambdas as packPersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import { packLambdas as packUserLambdas } from './lambdas/userLambdas.ts'

const options = commandLineArgs([
	{
		name: 'diff',
		type: Boolean,
		defaultValue: false,
	},
	{
		name: 'destroy',
		type: Boolean,
		defaultValue: false,
	},
	{
		name: 'list',
		type: Boolean,
		defaultValue: false,
	},
	{
		name: 'stackName',
		type: String,
	},
])

const tsConfigFilePath = path.join(process.cwd(), 'tsconfig.json')

const ctx = {
	version: process.env.VERSION ?? '0.0.0-development',
}

/**
 * This app is used for end-to-end testing and contains only the necessary
 * resources.
 */
const app = new FjordCleanUpTrashTestApp({
	lambdaSources: {
		user: await packUserLambdas(tsConfigFilePath),
		persistence: await packPersistenceLambdas(tsConfigFilePath),
		notifications: await packNotificationLambdas(tsConfigFilePath),
	},
	baseLayerSource: await packBaseLayer(),
	context: ctx,
})

const cdk = new Toolkit()

const cx = await cdk.fromAssemblyBuilder(async () => app.synth(), {
	contextStore: new MemoryContext(ctx),
})

const stacks =
	options.stackName !== undefined
		? {
				strategy: StackSelectionStrategy.PATTERN_MUST_MATCH_SINGLE,
				patterns: [options.stackName],
			}
		: undefined

if (options.diff === true) {
	await cdk.diff(cx, { stacks, method: DiffMethod.TemplateOnly() })
} else if (options.list === true) {
	await cdk.list(cx)
} else if (options.destroy === true) {
	await cdk.destroy(cx)
} else {
	await cdk.deploy(cx, { stacks })
}
