import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import { App, type Environment } from 'aws-cdk-lib'
import { AccountCustomDomainCertificateStack } from './AccountCustomDomainCertificateStack.ts'
import { AccountStack } from './AccountStack.ts'
import { AppCustomDomainCertificateStack } from './AppCustomDomainCertificateStack.ts'
import { CDStack } from './CDStack.ts'
import { HostingStack } from './HostingStack.ts'
import type { PersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import type { UserLambdas } from './lambdas/userLambdas.ts'
import { PersistenceStack } from './PersistenceStack.ts'
import { PublicAPIStack } from './PublicAPIStack.ts'

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
