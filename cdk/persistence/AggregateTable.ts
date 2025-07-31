import { isTest } from '@bifravst/aws-cdk-lambda-helpers/util'
import { RemovalPolicy, Stack } from 'aws-cdk-lib'
import {
	AttributeType,
	BillingMode,
	StreamViewType,
	Table,
} from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export abstract class AggregateTable extends Construct {
	public readonly table: Table

	constructor(scope: Construct, id: string) {
		super(scope, id)

		this.table = new Table(this, 'table', {
			tableName: `${Stack.of(this).stackName}-${id}`,
			billingMode: BillingMode.PAY_PER_REQUEST,
			stream: StreamViewType.NEW_AND_OLD_IMAGES,
			partitionKey: { name: 'aggregateId', type: AttributeType.STRING },
			pointInTimeRecoverySpecification: {
				pointInTimeRecoveryEnabled: !isTest(this),
			},
			removalPolicy: isTest(this)
				? RemovalPolicy.DESTROY
				: RemovalPolicy.RETAIN,
			deletionProtection: !isTest(this),
		})
	}
}
