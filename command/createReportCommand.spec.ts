import { TrashType } from '#domain/TrashType.ts'
import { EventNames } from '#event/EventNames.ts'
import type { ReportCreatedEvent } from '#event/ReportCreatedEvent.ts'
import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import { v1 } from '../aggregate/AggregateVersion.ts'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'
import { testActor } from '../test/testActor.ts'
import { createReportCommand } from './createReportCommand.ts'

void describe('createReportCommand()', () => {
	void it('should create a report and persist it', async () => {
		const persistMock = mock.fn<PersistReportFn>(async () =>
			Promise.resolve(true),
		)
		const create = createReportCommand(persistMock)

		const data: Omit<ReportAggregate, '$meta' | 'authorId'> = {
			description:
				"There is an aluminum ship mast on the ground here. It's at least 6 meters long.",
			location: {
				lat: 59.917740637491505,
				lng: 10.671264841123048,
			},
			photos: {
				'photo-1.jpeg': null,
			},
			type: [TrashType.Bulk],
		}
		const actorId = testActor()
		const report = await create(data, actorId)

		assert.partialDeepStrictEqual(report, {
			authorId: actorId,
			description: data.description,
			location: data.location,
			photos: data.photos,
			type: [TrashType.Bulk],
		})

		assert.partialDeepStrictEqual(report.$meta, {
			actorId,
			version: 1,
		})

		assert.ok(report.$meta.id !== undefined, 'Report ID should be defined')

		const expectedEvent: Partial<ReportCreatedEvent> = {
			eventName: EventNames.ReportCreated,
			aggregateName: AggregateNames.Report,
			aggregateId: report.$meta.id,
			aggregateVersion: v1,
			actorId,
			...data,
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
})
