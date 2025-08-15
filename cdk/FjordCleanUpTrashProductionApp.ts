import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import { App, type Environment } from 'aws-cdk-lib'
import type { NotificationLambdas } from './lambdas/notificationLambdas.ts'
import type { PersistenceLambdas } from './lambdas/persistenceLambdas.ts'
import type { UserLambdas } from './lambdas/userLambdas.ts'
import { AccountCustomDomainCertificateStack } from './stacks/AccountCustomDomainCertificateStack.ts'
import { AccountStack } from './stacks/AccountStack.ts'
import { AppCustomDomainCertificateStack } from './stacks/AppCustomDomainCertificateStack.ts'
import { CDStack } from './stacks/CDStack.ts'
import { HostingStack } from './stacks/HostingStack.ts'
import { NotificationsStack } from './stacks/NotificationsStack.ts'
import { PersistenceStack } from './stacks/PersistenceStack.ts'
import { PublicAPIStack } from './stacks/PublicAPIStack.ts'

export class FjordCleanUpTrashProductionApp extends App {
	public constructor({
		version,
		baseDomainName,
		gitHubOICDProviderArn,
		repository,
		webAppRepository,
		baseLayerSource,
		env,
		lambdaSources,
	}: {
		version: string
		baseDomainName: string
		gitHubOICDProviderArn: string
		repository: { owner: string; repo: string }
		webAppRepository: {
			owner: string
			repo: string
			environment?: string
		}
		lambdaSources: {
			user: UserLambdas
			persistence: PersistenceLambdas
			notifications: NotificationLambdas
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

		const notifications = new NotificationsStack(this, {
			baseDomainName,
			baseLayerSource,
			lambdaSources: lambdaSources.notifications,
		})
		notifications.addDependency(account)

		new CDStack(this, {
			gitHubOICDProviderArn,
			repository,
			webAppRepository,
		})
	}
}
