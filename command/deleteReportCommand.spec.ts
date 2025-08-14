import { EventNames } from '#event/EventNames.ts'
import type { ReportDeletedEvent } from '#event/ReportDeletedEvent.ts'
import { inc, v, v1 } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'
import { testActor } from '../test/testActor.ts'
import { testReport } from '../test/testReport.ts'
import { deleteReportCommand } from './deleteReportCommand.ts'

void describe('deleteReportCommand()', () => {
	void it('should delete a report and persist it', async () => {
		const existingReport = testReport()
		const persistMock = mock.fn<PersistReportFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findReportByIdFn>(async () =>
			Promise.resolve(existingReport),
		)
		const rm = deleteReportCommand(findMock, persistMock)

		const adminActorId = testActor()
		const report = await rm(existingReport.$meta.id, v1, adminActorId)

		assert.partialDeepStrictEqual(report, {
			$meta: {
				actorId: adminActorId,
				version: v(2),
			},
			isDeleted: true,
		})

		const expectedEvent: Partial<ReportDeletedEvent> = {
			eventName: EventNames.ReportDeleted,
			aggregateName: AggregateNames.Report,
			aggregateId: report.$meta.id,
			aggregateVersion: v(2),
			actorId: adminActorId,
		}

		assert.partialDeepStrictEqual(
			persistMock.mock.calls[0]?.arguments[0],
			report,
		)
		assert.partialDeepStrictEqual(
			persistMock.mock.calls[0]?.arguments[1],
			expectedEvent,
		)
	})

	void it('should throw an error if the report does not exist', async () => {
		const persistMock = mock.fn<PersistReportFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findReportByIdFn>(async () =>
			Promise.resolve(null),
		)

		const rm = deleteReportCommand(findMock, persistMock)

		const id = ulid() as ULID
		await assert.rejects(
			async () => {
				await rm(id, v1, testActor())
			},
			{
				name: 'NotFoundError',
				message: `Report ${id} not found!`,
			},
		)
	})

	void it('should throw an error if the report version does not match', async () => {
		const existingReport = testReport()
		const persistMock = mock.fn<PersistReportFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findReportByIdFn>(async () =>
			Promise.resolve(existingReport),
		)

		const rm = deleteReportCommand(findMock, persistMock)

		await assert.rejects(
			async () => {
				await rm(existingReport.$meta.id, inc(v1), testActor())
			},
			{
				name: 'ConflictError',
				message: `Report ${existingReport.$meta.id} version mismatch! Expected ${v1 + 1}, got ${v1}`,
			},
		)
	})
})
