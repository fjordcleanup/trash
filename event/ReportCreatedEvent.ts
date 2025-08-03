import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import type { AggregateEvent } from './AggregateEvent.ts'

export type ReportCreatedEvent = AggregateEvent &
	Omit<ReportAggregate, '$meta' | 'authorId'>
