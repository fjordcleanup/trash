import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { LambdaClient } from '@aws-sdk/client-lambda'
import type { PackedLambda } from '@bifravst/aws-cdk-lambda-helpers'
import { updateLambdaCode } from '@bifravst/aws-cdk-lambda-helpers/util'
import chalk from 'chalk'
import { packLambdas as packUserLambdas } from '../lambdas/userLambdas.ts'
import { PUBLIC_API_STACK_NAME } from '../stackName.ts'

const cf = new CloudFormationClient()
const lambda = new LambdaClient()
const update = updateLambdaCode({ cf, lambda })

const start = new Date()
const [UserLambdas] = await Promise.all([packUserLambdas()])
console.debug('Packed lambdas in', new Date().getTime() - start.getTime(), 'ms')

const stackLambdas: Array<[string, Record<string, PackedLambda>]> = [
	[PUBLIC_API_STACK_NAME, UserLambdas],
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
