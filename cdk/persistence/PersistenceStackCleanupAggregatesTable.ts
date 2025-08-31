import { Fn } from 'aws-cdk-lib'
import { Table, type ITable } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { PERSISTENCE_STACK_NAME } from '../stacks/stackName.ts'
import type { CleanupAggregatesTableReference } from './CleanupAggregatesTableReference.ts'

export class PersistenceStackCleanupAggregatesTable
	extends Construct
	implements CleanupAggregatesTableReference
{
	public readonly table: ITable
	constructor(scope: Construct) {
		super(scope, PersistenceStackCleanupAggregatesTable.name)

		this.table = Table.fromTableName(
			this,
			'table',
			Fn.importValue(`${PERSISTENCE_STACK_NAME}:cleanupAggregatesTableName`),
		)
	}
}
