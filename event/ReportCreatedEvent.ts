import type { AggregateEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import type { EventNames } from './EventNames.ts'

export type ReportCreatedEvent = Omit<AggregateEvent, 'eventName'> &
	Omit<ReportAggregate, '$meta' | 'authorId'> & {
		eventName: EventNames.ReportCreated
	}
