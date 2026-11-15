import type { AggregateEvent } from "@coderbyheart/aws-dynamodb-es-cqrs/event"
import type { SizedPhoto } from "../aggregate/SizedPhoto.ts"
import type { EventNames } from "./EventNames.ts"

export type SizedPhotoAddedEvent = Omit<AggregateEvent, "eventName"> & {
  eventName: (typeof EventNames)["SizedPhotoAdded"]
  photoId: string
  sizes: SizedPhoto
}
