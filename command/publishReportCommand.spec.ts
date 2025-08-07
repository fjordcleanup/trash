import type { ULID } from '#event/AggregateEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import type { ReportPublishedEvent } from '#event/ReportPublishedEvent.ts'
import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import { inc, v, v1 } from '../aggregate/AggregateVersion.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'
import { testActor } from '../test/testActor.ts'
import { testReport } from '../test/testReport.ts'
import { publishReportCommand } from './publishReportCommand.ts'

void describe('publishReportCommand()', () => {
	void it('should published a report and persist it', async () => {
		const existingReport = testReport()
		const persistMock = mock.fn<PersistReportFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findReportByIdFn>(async () =>
			Promise.resolve(existingReport),
		)
		const publish = publishReportCommand(findMock, persistMock)

		const adminActorId = testActor()
		const report = await publish(existingReport.$meta.id, v1, adminActorId)

		assert.partialDeepStrictEqual(report, {
			$meta: {
				actorId: adminActorId,
				version: v(2),
			},
			isPublic: true,
		})

		const expectedEvent: Partial<ReportPublishedEvent> = {
			eventName: EventNames.ReportPublished,
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

		const publish = publishReportCommand(findMock, persistMock)

		const id = ulid() as ULID
		await assert.rejects(
			async () => {
				await publish(id, v1, testActor())
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

		const publish = publishReportCommand(findMock, persistMock)

		await assert.rejects(
			async () => {
				await publish(existingReport.$meta.id, inc(v1), testActor())
			},
			{
				name: 'ConflictError',
				message: `Report ${existingReport.$meta.id} version mismatch! Expected ${v1 + 1}, got ${v1}`,
			},
		)
	})
})
