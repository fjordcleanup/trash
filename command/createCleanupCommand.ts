import type { CleanupReportedEvent } from '#event/CleanupReportedEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import { v1 } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import { NotFoundError } from '@coderbyheart/aws-dynamodb-es-cqrs/error'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import type { CleanupAggregate } from '../aggregate/CleanupAggregate.ts'
import { cleanupReducer } from '../aggregate/reducer/cleanupReducer.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistCleanupFn } from '../persistence/persistCleanup.ts'

export const createCleanupCommand =
	(persistCleanup: PersistCleanupFn, findReport: findReportByIdFn) =>
	async (
		data: Omit<CleanupAggregate, '$meta' | 'authorId' | 'state'>,
		actorId: string,
	): Promise<CleanupAggregate> => {
		const id = ulid() as ULID
		const { reportId, description, photos } = data

		const maybeReport = await findReport(reportId)
		if (maybeReport === undefined) {
			throw new NotFoundError(`Report not found: ${reportId}`)
		}

		const event: CleanupReportedEvent = {
			eventId: ulid() as ULID,
			eventName: EventNames.CleanupReported,
			aggregateName: AggregateNames.Cleanup,
			aggregateId: id,
			aggregateVersion: v1,
			actorId,
			reportId,
			description,
			photos,
		}

		const applied = cleanupReducer([event])

		await persistCleanup(applied, event)

		return applied
	}
