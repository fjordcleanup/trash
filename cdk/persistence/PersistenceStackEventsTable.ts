import { Fn } from 'aws-cdk-lib'
import { Table, type ITable } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { PERSISTENCE_STACK_NAME } from '../stackName.ts'
import type { EventsTableReference } from './EventsTableReference.ts'

export class PersistenceStackEventsTable
	extends Construct
	implements EventsTableReference
{
	public readonly table: ITable
	constructor(scope: Construct) {
		super(scope, PersistenceStackEventsTable.name)

		this.table = Table.fromTableName(
			this,
			'table',
			Fn.importValue(`${PERSISTENCE_STACK_NAME}:eventsTableName`),
		)
	}
}
