import type { AggregateEvent } from './AggregateEvent.ts'

export enum EventNames {
	ReportCreated = 'ReportCreated',
	SizedPhotoAdded = 'SizedPhotoAdded',
}

export const isAggregateEvent = (event: unknown): event is AggregateEvent => {
	if (typeof event !== 'object' || event === null) {
		return false
	}
	const e = event as AggregateEvent
	return (
		typeof e.eventId === 'string' &&
		typeof e.eventName === 'string' &&
		typeof e.aggregateName === 'string' &&
		typeof e.aggregateId === 'string' &&
		typeof e.aggregateVersion === 'number' &&
		typeof e.actorId === 'string'
	)
}

export const isNamedEvent =
	<Event extends AggregateEvent>(eventName: string) =>
	(event: unknown): event is Event =>
		isAggregateEvent(event) && event.eventName === eventName
