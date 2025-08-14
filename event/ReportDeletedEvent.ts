import type { AggregateEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { EventNames } from './EventNames.ts'

export type ReportDeletedEvent = Omit<AggregateEvent, 'eventName'> & {
	eventName: EventNames.ReportDeleted
}
