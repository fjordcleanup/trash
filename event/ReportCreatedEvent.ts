import type { ReportAggregate } from '../persistence/aggregate/ReportAggregate.ts'
import type { AggregateEvent } from '../persistence/event/AggregateEvent.ts'

export type ReportCreatedEvent = AggregateEvent & Omit<ReportAggregate, '$meta'>
