import type { IUserPool } from 'aws-cdk-lib/aws-cognito'

export type UserPoolReference = {
	readonly userPool: IUserPool
}
