import { type ULID } from 'ulidx'
import type { AggregateEvent } from '../event/AggregateEvent.ts'
import type { AggregateVersion } from './AggregateVersion.ts'
import { v1 } from './AggregateVersion.ts'

export type AggregateMeta = {
	id: ULID
	version: AggregateVersion
	actorId: string
	updatedAt?: Date
}

export const fromEvent = (event: AggregateEvent): AggregateMeta => ({
	id: event.aggregateId,
	version: v1,
	actorId: event.actorId,
})
