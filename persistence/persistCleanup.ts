import type { PersistFn } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import type { CleanupAggregate } from '../aggregate/CleanupAggregate.ts'

export type PersistCleanupFn = PersistFn<CleanupAggregate>
