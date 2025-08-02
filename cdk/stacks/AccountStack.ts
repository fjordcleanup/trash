import type { App, Environment } from 'aws-cdk-lib'
import { CfnOutput, Stack } from 'aws-cdk-lib'
import { AccountCognito } from '../persistence/AccountCognito.ts'
import { ACCOUNT_STACK_NAME } from './stackName.ts'

export class AccountStack extends Stack {
	public constructor(
		parent: App,
		{
			baseDomainName,
			env,
		}: {
			baseDomainName: string
			env: Environment
		},
	) {
		super(parent, ACCOUNT_STACK_NAME, {
			env,
			description: `Cognito instance for user registration.`,
		})

		const account = new AccountCognito(this, {
			baseDomainName,
		})

		new CfnOutput(this, 'userPoolId', {
			value: account.userPool.userPoolId,
			description: 'Cognito User Pool ID',
			exportName: `${Stack.of(this).stackName}:userPoolId`,
		})

		new CfnOutput(this, 'userPoolProviderName', {
			value: account.userPool.userPoolProviderName,
			description: 'Cognito User Pool Provider Name',
			exportName: `${Stack.of(this).stackName}:userPoolProviderName`,
		})

		new CfnOutput(this, 'identityPoolId', {
			value: account.identityPool.ref,
			description: 'Cognito Identity Pool ID',
			exportName: `${Stack.of(this).stackName}:identityPoolId`,
		})

		new CfnOutput(this, 'userPoolClientId', {
			value: account.userPoolClient.userPoolClientId,
			description: 'Cognito User Pool Client ID',
			exportName: `${Stack.of(this).stackName}:userPoolClientId`,
		})

		new CfnOutput(this, 'unauthenticatedUserRoleArn', {
			value: account.unauthenticatedUserRole.roleArn,
			description: 'Cognito Unauthenticated User Role ARN',
			exportName: `${Stack.of(this).stackName}:unauthenticatedUserRoleArn`,
		})

		new CfnOutput(this, 'authenticatedUserRoleArn', {
			value: account.authenticatedUserRole.roleArn,
			description: 'Cognito Authenticated User Role ARN',
			exportName: `${Stack.of(this).stackName}:authenticatedUserRoleArn`,
		})

		new CfnOutput(this, 'adminRoleArn', {
			value: account.adminRole.roleArn,
			description: 'Admin Role ARN',
			exportName: `${Stack.of(this).stackName}:adminRoleArn`,
		})
	}
}
export type StackOutputs = {
	userPoolId: string
	userPoolProviderName: string
	userPoolClientId: string
	identityPoolId: string
	authenticatedUserRoleArn: string
	unauthenticatedUserRoleArn: string
	adminRoleArn: string
}
