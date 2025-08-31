import type { AggregateEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { EventNames } from './EventNames.ts'

export type CleanupApprovedEvent = Omit<AggregateEvent, 'eventName'> & {
	eventName: EventNames.CleanupApproved
}
