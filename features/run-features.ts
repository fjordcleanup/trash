import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { runFolder } from '@bifravst/bdd-markdown'
import { stackOutput } from '@bifravst/cloudformation-helpers'
import { steps as RESTSteps } from '@hello.nrfcloud.com/bdd-markdown-steps/REST'
import chalk from 'chalk'
import path from 'node:path'
import type { StackOutputs as PublicAPIStackName } from '../cdk/stacks/PublicAPIStack.ts'
import { PUBLIC_API_STACK_NAME } from '../cdk/stacks/stackName.ts'

const cf = new CloudFormationClient({})

const { apiURL } = await stackOutput(cf)<PublicAPIStackName>(
	PUBLIC_API_STACK_NAME,
)

const print = (arg: unknown) =>
	typeof arg === 'object' ? JSON.stringify(arg) : arg
const start = Date.now()
const ts = () => {
	const diff = Date.now() - start
	return chalk.gray(`[${(diff / 1000).toFixed(3).padStart(8, ' ')}]`)
}

const runner = await runFolder({
	folder: path.join(process.cwd(), 'features'),
	name: 'trash.fjordcleanup.org backend',
	logObserver: {
		onDebug: (info, ...args) =>
			console.error(
				ts(),
				chalk.magenta.dim(info.step.keyword),
				chalk.magenta(info.step.title),
				...args.map((arg) => chalk.cyan(print(arg))),
			),
		onError: (info, ...args) =>
			console.error(
				ts(),
				chalk.magenta.dim(info.step.keyword),
				chalk.magenta(info.step.title),
				...args.map((arg) => chalk.cyan(print(arg))),
			),
		onInfo: (info, ...args) =>
			console.error(
				ts(),
				chalk.magenta.dim(info.step.keyword),
				chalk.magenta(info.step.title),
				...args.map((arg) => chalk.cyan(print(arg))),
			),
		onProgress: (info, ...args) =>
			console.error(
				ts(),
				chalk.magenta.dim(info.step.keyword),
				chalk.magenta(info.step.title),
				...args.map((arg) => chalk.cyan(print(arg))),
			),
	},
})

runner.addStepRunners(...RESTSteps)

const res = await runner.run({
	apiURL: apiURL.toString().replace(/\/+$/, ''),
	VERSION: process.env.VERSION ?? '0.0.0-development',
})

console.error(`Writing to stdout ...`)
process.stdout.write(JSON.stringify(res, null, 2), () => {
	console.error(`Done`, res.ok ? chalk.green('OK') : chalk.red('ERROR'))
})
