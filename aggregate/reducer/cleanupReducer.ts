import type { CleanUpReportedEvent } from '#event/CleanUpReportedEvent.ts'
import type { CleanupApprovedEvent } from '#event/CleanupApprovedEvent.ts'
import type { CleanupRejectedEvent } from '#event/CleanupRejectedEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import {
	fromEvent,
	reduceEvents,
	updateFromEvent,
} from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import {
	assertAggregateEvent,
	isNamedEvent,
} from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import { CleanupState, type CleanupAggregate } from '../CleanupAggregate.ts'

export const cleanupReducer = reduceEvents<CleanupAggregate>(
	(event, aggregate) => {
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
		if (isCleanupApprovedEvent(event)) {
			assertAggregateEvent(aggregate, event)
			return {
				...aggregate,
				$meta: updateFromEvent(aggregate.$meta, event),
				state: CleanupState.approved,
			}
		}
		if (isCleanupRejectedEvent(event)) {
			assertAggregateEvent(aggregate, event)
			return {
				...aggregate,
				$meta: updateFromEvent(aggregate.$meta, event),
				state: CleanupState.rejected,
			}
		}
		return undefined
	},
)

const isCleanUpReportedEvent = isNamedEvent<CleanUpReportedEvent>(
	EventNames.CleanUpReported,
)

const isCleanupApprovedEvent = isNamedEvent<CleanupApprovedEvent>(
	EventNames.CleanupApproved,
)

const isCleanupRejectedEvent = isNamedEvent<CleanupRejectedEvent>(
	EventNames.CleanupRejected,
)
