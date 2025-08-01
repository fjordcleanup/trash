import type { ReportCreatedEvent } from '../../event/ReportCreatedEvent.ts'
import type { SizedPhotoAddedEvent } from '../../event/SizedPhotoAddedEvent.ts'
import { fromEvent, updateFromEvent } from '../aggregate/AggregateMeta.ts'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import { assertAggregateEvent } from '../event/assertAggregateEvent.ts'
import { EventNames, isNamedEvent } from '../event/EventNames.ts'
import { reduceEvents } from './reduceEvents.ts'

export const reportReducer = reduceEvents<ReportAggregate>(
	(event, aggregate) => {
		if (isReportCreatedEvent(event)) {
			return {
				$meta: fromEvent(event),
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
		return undefined
	},
)

const isReportCreatedEvent = isNamedEvent<ReportCreatedEvent>(
	EventNames.ReportCreated,
)

const isSizedPhotoAddedEvent = isNamedEvent<SizedPhotoAddedEvent>(
	EventNames.SizedPhotoAdded,
)
