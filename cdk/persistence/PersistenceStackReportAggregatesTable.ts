import { Fn } from 'aws-cdk-lib'
import { Table, type ITable } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { PERSISTENCE_STACK_NAME } from '../stacks/stackName.ts'
import type { ReportAggregatesTableReference } from './ReportAggregatesTableReference.ts'

export class PersistenceStackReportAggregatesTable
	extends Construct
	implements ReportAggregatesTableReference
{
	public readonly table: ITable
	constructor(scope: Construct) {
		super(scope, PersistenceStackReportAggregatesTable.name)

		this.table = Table.fromTableName(
			this,
			'table',
			Fn.importValue(`${PERSISTENCE_STACK_NAME}:reportAggregatesTableName`),
		)
	}
}
