import { Fn } from 'aws-cdk-lib'
import { UserPool, type IUserPool } from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'
import { ACCOUNT_STACK_NAME } from '../stacks/stackName.ts'
import type { UserPoolReference } from './UserPoolReference.ts'

export class AccountStackUserPool
	extends Construct
	implements UserPoolReference
{
	public readonly userPool: IUserPool
	constructor(scope: Construct) {
		super(scope, AccountStackUserPool.name)

		this.userPool = UserPool.fromUserPoolId(
			this,
			'userPool',
			Fn.importValue(`${ACCOUNT_STACK_NAME}:userPoolId`),
		)
	}
}
