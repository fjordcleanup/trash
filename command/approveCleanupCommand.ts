import type { CleanupApprovedEvent } from '#event/CleanupApprovedEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import {
	inc,
	type AggregateVersion,
} from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import {
	ConflictError,
	NotFoundError,
} from '@coderbyheart/aws-dynamodb-es-cqrs/error'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import type { CleanupAggregate } from '../aggregate/CleanupAggregate.ts'
import { cleanupReducer } from '../aggregate/reducer/cleanupReducer.ts'
import type { findCleanupByIdFn } from '../persistence/findCleanupByIdFn.ts'
import type { PersistCleanupFn } from '../persistence/persistCleanup.ts'

export const approveCleanupCommand =
	(findCleanupById: findCleanupByIdFn, persistCleanup: PersistCleanupFn) =>
	async (
		cleanupId: ULID,
		version: AggregateVersion,
		actorId: string,
	): Promise<CleanupAggregate> => {
		const maybeCleanup = await findCleanupById(cleanupId)
		if (maybeCleanup === null) {
			throw new NotFoundError(`Cleanup ${cleanupId} not found!`)
		}

		if (maybeCleanup.$meta.version !== version) {
			throw new ConflictError(
				`Cleanup ${cleanupId} version mismatch! Expected ${version}, got ${maybeCleanup.$meta.version}`,
			)
		}

		const event: CleanupApprovedEvent = {
			eventId: ulid() as ULID,
			eventName: EventNames.CleanupApproved,
			aggregateName: AggregateNames.Cleanup,
			aggregateId: maybeCleanup.$meta.id,
			aggregateVersion: inc(maybeCleanup.$meta.version),
			actorId,
		}

		const applied = cleanupReducer([event], maybeCleanup)

		await persistCleanup(applied, event)

		return applied
	}
