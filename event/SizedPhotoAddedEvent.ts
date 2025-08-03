import type { SizedPhoto } from '../aggregate/ReportAggregate.ts'
import type { AggregateEvent } from './AggregateEvent.ts'

export type SizedPhotoAddedEvent = AggregateEvent & {
	photoId: string
	sizes: SizedPhoto
}
