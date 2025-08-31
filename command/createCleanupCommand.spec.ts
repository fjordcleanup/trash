import type { CleanUpReportedEvent } from '#event/CleanUpReportedEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import { v1 } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import type { PersistCleanupFn } from '../persistence/persistCleanup.ts'
import { testActor } from '../test/testActor.ts'
import { createCleanupCommand } from './createCleanupCommand.ts'

void describe('createCleanupCommand()', () => {
	void it('should create a cleanup and persist it', async () => {
		const persistMock = mock.fn<PersistCleanupFn>(async () =>
			Promise.resolve(true),
		)
		const create = createCleanupCommand(persistMock)

		const data = {
			reportId: ulid() as ULID,
			description:
				'I cleaned up the aluminum ship mast and disposed of it properly.',
			photos: {
				'photo-1.jpeg': null,
			},
		}
		const actorId = testActor()
		const cleanup = await create(data, actorId)

		assert.partialDeepStrictEqual(cleanup, {
			authorId: actorId,
			reportId: data.reportId,
			description: data.description,
			photos: data.photos,
			state: undefined,
		})

		assert.partialDeepStrictEqual(cleanup.$meta, {
			actorId,
			version: 1,
		})

		assert.ok(cleanup.$meta.id !== undefined, 'Cleanup ID should be defined')

		const expectedEvent: Partial<CleanUpReportedEvent> = {
			eventName: EventNames.CleanUpReported,
			aggregateName: AggregateNames.Cleanup,
			aggregateId: cleanup.$meta.id,
			aggregateVersion: v1,
			actorId,
			reportId: data.reportId,
			description: data.description,
			photos: data.photos,
		}

		assert.partialDeepStrictEqual(
			persistMock.mock.calls[0]?.arguments[0],
			cleanup,
		)
		assert.partialDeepStrictEqual(
			persistMock.mock.calls[0]?.arguments[1],
			expectedEvent,
		)
	})

	void it('should create a cleanup without photos', async () => {
		const persistMock = mock.fn<PersistCleanupFn>(async () =>
			Promise.resolve(true),
		)
		const create = createCleanupCommand(persistMock)

		const data = {
			reportId: ulid() as ULID,
			description:
				'I cleaned up the aluminum ship mast and disposed of it properly.',
		}
		const actorId = testActor()
		const cleanup = await create(data, actorId)

		assert.partialDeepStrictEqual(cleanup, {
			authorId: actorId,
			reportId: data.reportId,
			description: data.description,
			photos: undefined,
			state: undefined,
		})
	})
})
