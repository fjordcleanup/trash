import type { AggregateEvent } from "@coderbyheart/aws-dynamodb-es-cqrs/event"
import type { EventNames } from "./EventNames.ts"

export type ReportPublishedEvent = Omit<AggregateEvent, "eventName"> & {
  eventName: (typeof EventNames)["ReportPublished"]
}
