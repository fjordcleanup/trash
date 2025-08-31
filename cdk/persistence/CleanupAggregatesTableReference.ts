import type { ITable } from 'aws-cdk-lib/aws-dynamodb'

export type CleanupAggregatesTableReference = {
	table: ITable
}
