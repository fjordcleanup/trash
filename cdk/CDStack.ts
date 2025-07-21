import { ContinuousDeployment } from '@bifravst/ci'
import type { App } from 'aws-cdk-lib'
import { Stack } from 'aws-cdk-lib'
import { CD_STACK_NAME } from './stackName.ts'

export class CDStack extends Stack {
	public constructor(
		parent: App,
		{
			repository,
			gitHubOICDProviderArn,
		}: {
			repository: {
				owner: string
				repo: string
			}
			gitHubOICDProviderArn: string
		},
	) {
		super(parent, CD_STACK_NAME, {
			description: `Enables continuous deployment of the web app.`,
		})

		new ContinuousDeployment(this, {
			repository,
			gitHubOICDProviderArn,
			environment: this.node.tryGetContext('gitHubEnvironment') as string,
		})
	}
}
