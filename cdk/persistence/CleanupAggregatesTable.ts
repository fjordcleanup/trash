import type { Construct } from 'constructs'
import { AggregateTable } from './AggregateTable.ts'
import type { CleanupAggregatesTableReference } from './CleanupAggregatesTableReference.ts'

export class CleanupAggregatesTable
	extends AggregateTable
	implements CleanupAggregatesTableReference
{
	constructor(scope: Construct) {
		super(scope, CleanupAggregatesTable.name)
	}
}
