import type { CleanUpReportedEvent } from '#event/CleanUpReportedEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import {
	fromEvent,
	reduceEvents,
} from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import { isNamedEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { CleanupAggregate } from '../CleanupAggregate.ts'

export const cleanupReducer = reduceEvents<CleanupAggregate>(
	(event, aggregate) => {
		void aggregate
		if (isCleanUpReportedEvent(event)) {
			return {
				$meta: fromEvent(event),
				authorId: event.actorId,
				reportId: event.reportId,
				description: event.description,
				photos: event.photos,
				state: event.state,
			}
		}
		return undefined
	},
)

const isCleanUpReportedEvent = isNamedEvent<CleanUpReportedEvent>(
	EventNames.CleanUpReported,
)
