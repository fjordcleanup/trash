import { v1 } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import { ulid } from 'ulidx'
import type { CleanupAggregate } from '../aggregate/CleanupAggregate.ts'
import { testActor } from './testActor.ts'

export const testCleanup = (): CleanupAggregate => {
	const actorId = testActor()
	return {
		$meta: {
			actorId,
			id: ulid() as ULID,
			version: v1,
		},
		authorId: actorId,
		reportId: ulid() as ULID,
		description:
			'Cleaned up the aluminum ship mast. Took it to recycling center.',
		photos: {
			'cleanup-photo-1.jpeg': null,
		},
	}
}
