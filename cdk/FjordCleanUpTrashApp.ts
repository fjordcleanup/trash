import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import { App, type Environment } from 'aws-cdk-lib'
import type { PersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import type { UserLambdas } from './lambdas/userLambdas.ts'
import { AccountCustomDomainCertificateStack } from './stacks/AccountCustomDomainCertificateStack.ts'
import { AccountStack } from './stacks/AccountStack.ts'
import { AppCustomDomainCertificateStack } from './stacks/AppCustomDomainCertificateStack.ts'
import { CDStack } from './stacks/CDStack.ts'
import { HostingStack } from './stacks/HostingStack.ts'
import { PersistenceStack } from './stacks/PersistenceStack.ts'
import { PublicAPIStack } from './stacks/PublicAPIStack.ts'

export class FjordCleanUpTrashApp extends App {
	public constructor({
		version,
		baseDomainName,
		gitHubOICDProviderArn,
		repository,
		baseLayerSource,
		env,
		lambdaSources,
	}: {
		version: string
		baseDomainName: string
		gitHubOICDProviderArn: string
		repository: { owner: string; repo: string }
		lambdaSources: {
			user: UserLambdas
			persistence: PersistenceLambdas
		}
		baseLayerSource: PackedLayer
		env: Environment
	}) {
		super({
			context: {
				isTest: false,
				version,
			},
		})

		const domain = new AppCustomDomainCertificateStack(this, {
			baseDomainName,
			env,
		})

		const hosting = new HostingStack(this, {
			baseDomainName,
			env,
		})
		hosting.addDependency(domain)

		const accountDomain = new AccountCustomDomainCertificateStack(this, {
			baseDomainName,
			env,
		})

		const account = new AccountStack(this, {
			baseDomainName,
			env,
		})
		account.addDependency(accountDomain)

		const persistence = new PersistenceStack(this, {
			baseDomainName,
			lambdaSources: lambdaSources.persistence,
			baseLayerSource,
		})

		const publicAPI = new PublicAPIStack(this, {
			baseDomainName,
			env,
			baseLayerSource,
			lambdaSources: lambdaSources.user,
		})
		publicAPI.addDependency(account)
		publicAPI.addDependency(persistence)

		new CDStack(this, {
			gitHubOICDProviderArn,
			repository,
		})
	}
}
