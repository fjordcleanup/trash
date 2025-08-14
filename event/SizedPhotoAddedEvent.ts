import type { AggregateEvent } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { SizedPhoto } from '../aggregate/ReportAggregate.ts'
import type { EventNames } from './EventNames.ts'

export type SizedPhotoAddedEvent = Omit<AggregateEvent, 'eventName'> & {
	eventName: EventNames.SizedPhotoAdded
	photoId: string
	sizes: SizedPhoto
}
