import { IAMClient } from '@aws-sdk/client-iam'
import { STSClient } from '@aws-sdk/client-sts'
import { ensureGitHubOIDCProvider } from '@bifravst/ci'
import { fromEnv } from '@bifravst/from-env'
import chalk from 'chalk'
import { env } from '../aws/env.ts'
import pJSON from '../package.json' with { type: 'json' }
import { FjordCleanUpTrashApp } from './FjordCleanUpTrashApp.ts'
import { pack as packBaseLayer } from './lambdas/baseLayer.ts'
import { packLambdas as packPersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import { packLambdas as packUserLambdas } from './lambdas/userLambdas.ts'

const { version, baseDomainName } = fromEnv({
	baseDomainName: 'BASE_DOMAIN_NAME',
	version: 'VERSION',
})(process.env)

const iam = new IAMClient({})
const sts = new STSClient({})

const accountEnv = await env({ sts })

const repoUrl = new URL(pJSON.repository.url)
const repository = {
	owner: repoUrl.pathname.split('/')[1] ?? 'fjordcleanup',
	repo: repoUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ?? 'trash',
}

for (const [k, v] of Object.entries({
	'Base domain name': baseDomainName,
	'Web App Owner': repository.owner,
	'Web App Repo': repository.repo,
})) {
	console.debug(chalk.magenta(k), chalk.green(v))
}

new FjordCleanUpTrashApp({
	repository,
	baseDomainName,
	gitHubOICDProviderArn: await ensureGitHubOIDCProvider({
		iam,
	}),
	env: accountEnv,
	lambdaSources: {
		user: await packUserLambdas(),
		persistence: await packPersistenceLambdas(),
	},
	baseLayerSource: await packBaseLayer(),
	version,
})
