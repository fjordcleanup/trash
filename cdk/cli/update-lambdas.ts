import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { LambdaClient } from '@aws-sdk/client-lambda'
import type { PackedLambda } from '@bifravst/aws-cdk-lambda-helpers'
import { updateLambdaCode } from '@bifravst/aws-cdk-lambda-helpers/util'
import chalk from 'chalk'
import path from 'node:path'
import { packLambdas as packNotificationLambdas } from '../lambdas/notificationLambdas.ts'
import { packLambdas as packPersistenceLambdas } from '../lambdas/persistenceLambdas.ts'
import { packLambdas as packUserLambdas } from '../lambdas/userLambdas.ts'
import {
	NOTIFICATIONS_STACK_NAME,
	PERSISTENCE_STACK_NAME,
	PUBLIC_API_STACK_NAME,
} from '../stacks/stackName.ts'

const cf = new CloudFormationClient()
const lambda = new LambdaClient()
const update = updateLambdaCode({ cf, lambda })

const tsConfigFilePath = path.join(process.cwd(), 'tsconfig.json')

const start = new Date()
const [UserLambdas, PersistenceLambdas, NotificationLambdas] =
	await Promise.all([
		packUserLambdas(tsConfigFilePath),
		packPersistenceLambdas(tsConfigFilePath),
		packNotificationLambdas(tsConfigFilePath),
	])
console.debug('Packed lambdas in', new Date().getTime() - start.getTime(), 'ms')

const stackLambdas: Array<[string, Record<string, PackedLambda>]> = [
	[PUBLIC_API_STACK_NAME, UserLambdas],
	[PERSISTENCE_STACK_NAME, PersistenceLambdas],
	[NOTIFICATIONS_STACK_NAME, NotificationLambdas],
]

await Promise.all(
	stackLambdas.map(async ([stackName, lambdas]) =>
		update(stackName, lambdas, (arg, ...args) =>
			console.debug(chalk.blue(`[${stackName}]`), chalk.green(arg), ...args),
		),
	),
)

console.debug('Done')

console.debug(
	'Updated lambdas in',
	new Date().getTime() - start.getTime(),
	'ms',
)
