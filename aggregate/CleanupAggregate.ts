import type { AggregateMeta } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { SizedPhoto } from './SizedPhoto.ts'

export enum CleanupState {
	approved = 'approved',
	rejected = 'rejected',
}

export type CleanupAggregate = {
	$meta: AggregateMeta
	authorId: string
	reportId: ULID // Reference to the trash report being cleaned
	description: string
	photos?: Record<string, null | SizedPhoto> // Can have 0-2 photos
	state?: CleanupState
}
