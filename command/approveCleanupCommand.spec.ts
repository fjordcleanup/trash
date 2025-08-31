import type { CleanupApprovedEvent } from '#event/CleanupApprovedEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import { inc, v, v1 } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import { CleanupState } from '../aggregate/CleanupAggregate.ts'
import type { findCleanupByIdFn } from '../persistence/findCleanupByIdFn.ts'
import type { PersistCleanupFn } from '../persistence/persistCleanup.ts'
import { testActor } from '../test/testActor.ts'
import { testCleanup } from '../test/testCleanup.ts'
import { approveCleanupCommand } from './approveCleanupCommand.ts'

void describe('approveCleanupCommand()', () => {
	void it('should approve a cleanup and persist it', async () => {
		const existingCleanup = testCleanup()
		const persistMock = mock.fn<PersistCleanupFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findCleanupByIdFn>(async () =>
			Promise.resolve(existingCleanup),
		)
		const approve = approveCleanupCommand(findMock, persistMock)

		const adminActorId = testActor()
		const cleanup = await approve(existingCleanup.$meta.id, v1, adminActorId)

		assert.partialDeepStrictEqual(cleanup, {
			$meta: {
				actorId: adminActorId,
				version: v(2),
			},
			state: CleanupState.approved,
		})

		const expectedEvent: Partial<CleanupApprovedEvent> = {
			eventName: EventNames.CleanupApproved,
			aggregateName: AggregateNames.Cleanup,
			aggregateId: cleanup.$meta.id,
			aggregateVersion: v(2),
			actorId: adminActorId,
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

	void it('should throw an error if the cleanup does not exist', async () => {
		const persistMock = mock.fn<PersistCleanupFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findCleanupByIdFn>(async () =>
			Promise.resolve(null),
		)

		const approve = approveCleanupCommand(findMock, persistMock)

		const id = ulid() as ULID
		await assert.rejects(
			async () => {
				await approve(id, v1, testActor())
			},
			{
				name: 'NotFoundError',
				message: `Cleanup ${id} not found!`,
			},
		)
	})

	void it('should throw an error if the cleanup version does not match', async () => {
		const existingCleanup = testCleanup()
		const persistMock = mock.fn<PersistCleanupFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findCleanupByIdFn>(async () =>
			Promise.resolve(existingCleanup),
		)

		const approve = approveCleanupCommand(findMock, persistMock)

		await assert.rejects(
			async () => {
				await approve(existingCleanup.$meta.id, inc(v1), testActor())
			},
			{
				name: 'ConflictError',
				message: `Cleanup ${existingCleanup.$meta.id} version mismatch! Expected ${v1 + 1}, got ${v1}`,
			},
		)
	})
})
