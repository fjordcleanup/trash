import { type ITable } from 'aws-cdk-lib/aws-dynamodb'

export type ReportAggregatesTableReference = {
	readonly table: ITable
}
