import type { ReportCreatedEvent } from '../../event/ReportCreatedEvent.ts'
import { fromEvent } from '../aggregate/AggregateMeta.ts'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import { EventNames, isNamedEvent } from '../event/EventNames.ts'
import { reduceEvents } from './reduceEvents.ts'

export const reportReducer = reduceEvents<ReportAggregate>((event) => {
	if (isReportCreatedEvent(event)) {
		return <ReportAggregate>{
			$meta: fromEvent(event),
			type: event.type,
			location: event.location,
			description: event.description,
			numPhotos: event.numPhotos,
		}
	}
	return undefined
})

const isReportCreatedEvent = isNamedEvent<ReportCreatedEvent>(
	EventNames.ReportCreated,
)
