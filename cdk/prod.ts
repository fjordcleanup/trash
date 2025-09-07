import {
	DiffMethod,
	MemoryContext,
	StackSelectionStrategy,
	Toolkit,
} from '@aws-cdk/toolkit-lib'
import { IAMClient } from '@aws-sdk/client-iam'
import { ensureGitHubOIDCProvider } from '@bifravst/ci'
import { fromEnv } from '@bifravst/from-env'
import chalk from 'chalk'
import commandLineArgs from 'command-line-args'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from '../aws/env.ts'
import pJSON from '../package.json' with { type: 'json' }
import { FjordCleanUpTrashProductionApp } from './FjordCleanUpTrashProductionApp.ts'
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
		name: 'list',
		type: Boolean,
		defaultValue: false,
	},
	{
		name: 'stackName',
		type: String,
	},
])

const { version, baseDomainName } = fromEnv({
	baseDomainName: 'BASE_DOMAIN_NAME',
	version: 'VERSION',
})(process.env)

const iam = new IAMClient({})

const accountEnv = await env()

const repoUrl = new URL(pJSON.repository.url)
const repository = {
	owner: repoUrl.pathname.split('/')[1] ?? 'fjordcleanup',
	repo: repoUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ?? 'trash',
}

const webAppRepositoryUrl = new URL(pJSON.webAppRepository.url)
const webAppRepository = {
	owner: webAppRepositoryUrl.pathname.split('/')[1] ?? 'fjordcleanup',
	repo:
		webAppRepositoryUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ??
		'trash-web',
}

for (const [k, v] of Object.entries({
	'Base domain name': baseDomainName,
	'Backend Owner': repository.owner,
	'Backend Repo': repository.repo,
	'Web App Owner': webAppRepository.owner,
	'Web App Repo': webAppRepository.repo,
})) {
	console.debug(chalk.magenta(k), chalk.green(v))
}

const tsConfigFilePath = path.join(process.cwd(), 'tsconfig.json')

const ctx = {
	...JSON.parse(
		await readFile(path.join(process.cwd(), 'cdk.context.json'), 'utf-8'),
	),
	version,
}

const app = new FjordCleanUpTrashProductionApp({
	repository,
	webAppRepository,
	baseDomainName,
	gitHubOICDProviderArn: await ensureGitHubOIDCProvider({
		iam,
	}),
	env: accountEnv,
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
} else {
	await cdk.deploy(cx, { stacks })
}
