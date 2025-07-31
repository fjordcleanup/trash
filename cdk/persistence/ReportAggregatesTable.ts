import type { Construct } from 'constructs'
import { AggregateTable } from './AggregateTable.ts'
import type { ReportAggregatesTableReference } from './ReportAggregatesTableReference.ts'

export class ReportAggregatesTable
	extends AggregateTable
	implements ReportAggregatesTableReference
{
	constructor(scope: Construct) {
		super(scope, ReportAggregatesTable.name)
	}
}
