import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { CleanupAggregate } from '../aggregate/CleanupAggregate.ts'

export type findCleanupByIdFn = (
	cleanupId: ULID,
) => Promise<CleanupAggregate | null>
