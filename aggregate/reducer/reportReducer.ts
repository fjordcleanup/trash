import { assertAggregateEvent } from '#event/assertAggregateEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import { isNamedEvent } from '#event/isNamedEvent.ts'
import type { ReportCreatedEvent } from '#event/ReportCreatedEvent.ts'
import type { ReportDeletedEvent } from '#event/ReportDeletedEvent.ts'
import type { ReportPublishedEvent } from '#event/ReportPublishedEvent.ts'
import type { SizedPhotoAddedEvent } from '#event/SizedPhotoAddedEvent.ts'
import { fromEvent, updateFromEvent } from '../AggregateMeta.ts'
import type { ReportAggregate } from '../ReportAggregate.ts'
import { reduceEvents } from './reduceEvents.ts'

export const reportReducer = reduceEvents<ReportAggregate>(
	(event, aggregate) => {
		if (isReportCreatedEvent(event)) {
			return {
				$meta: fromEvent(event),
				authorId: event.actorId,
				type: event.type,
				location: event.location,
				description: event.description,
				photos: event.photos,
			}
		}
		if (isSizedPhotoAddedEvent(event)) {
			assertAggregateEvent(aggregate, event)
			return {
				...aggregate,
				$meta: updateFromEvent(aggregate.$meta, event),
				photos: {
					...aggregate.photos,
					[event.photoId]: event.sizes,
				},
			}
		}
		if (isReportDeletedEvent(event)) {
			assertAggregateEvent(aggregate, event)
			return {
				...aggregate,
				$meta: updateFromEvent(aggregate.$meta, event),
				isDeleted: true,
			}
		}
		if (isReportPublishedEvent(event)) {
			assertAggregateEvent(aggregate, event)
			return {
				...aggregate,
				$meta: updateFromEvent(aggregate.$meta, event),
				isPublic: true,
			}
		}
		return undefined
	},
)

const isReportCreatedEvent = isNamedEvent<ReportCreatedEvent>(
	EventNames.ReportCreated,
)

const isSizedPhotoAddedEvent = isNamedEvent<SizedPhotoAddedEvent>(
	EventNames.SizedPhotoAdded,
)

const isReportDeletedEvent = isNamedEvent<ReportDeletedEvent>(
	EventNames.ReportDeleted,
)

const isReportPublishedEvent = isNamedEvent<ReportPublishedEvent>(
	EventNames.ReportPublished,
)
