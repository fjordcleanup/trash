import { IAMClient } from '@aws-sdk/client-iam'
import { STSClient } from '@aws-sdk/client-sts'
import { ensureGitHubOIDCProvider } from '@bifravst/ci'
import chalk from 'chalk'
import { env } from '../aws/env.ts'
import pJSON from '../package.json' with { type: 'json' }
import { FjordCleanUpTrashApp } from './FjordCleanUpTrashApp.ts'

const iam = new IAMClient({})
const sts = new STSClient({})

const accountEnv = await env({ sts })

const baseDomainName = process.env.BASE_DOMAIN_NAME ?? 'fjordcleanup.org'

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
})
