import { type ITable } from 'aws-cdk-lib/aws-dynamodb'

export type EventsTableReference = {
	readonly table: ITable
}
