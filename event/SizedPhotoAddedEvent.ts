import type { SizedPhoto } from '../persistence/aggregate/ReportAggregate.ts'
import type { AggregateEvent } from '../persistence/event/AggregateEvent.ts'

export type SizedPhotoAddedEvent = AggregateEvent & {
	photoId: string
	sizes: SizedPhoto
}
