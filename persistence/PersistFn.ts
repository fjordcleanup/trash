import type { AggregateMeta } from './aggregate/AggregateMeta.ts'
import type { AggregateEvent } from './event/AggregateEvent.ts'

export type PersistFn<
	A extends Record<string, unknown> & { $meta: AggregateMeta },
> = (aggregate: A, event: AggregateEvent) => Promise<true>
