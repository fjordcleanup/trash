import type { AggregateEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { CleanupAggregate } from '../aggregate/CleanupAggregate.ts'
import type { EventNames } from './EventNames.ts'

export type CleanupReportedEvent = Omit<AggregateEvent, 'eventName'> &
	Omit<CleanupAggregate, '$meta' | 'authorId'> & {
		eventName: EventNames.CleanupReported
	}
