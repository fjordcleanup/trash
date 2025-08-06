import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import { v } from '../aggregate/AggregateVersion.ts'
import { PhotoSize } from '../domain/PhotoSize.ts'
import type { ULID } from '../event/AggregateEvent.ts'
import { EventNames } from '../event/EventNames.ts'
import type { SizedPhotoAddedEvent } from '../event/SizedPhotoAddedEvent.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'
import { testActor } from '../test/testActor.ts'
import { testReport } from '../test/testReport.ts'
import { addSizedPhotoCommand } from './addSizedPhotoCommand.ts'

void describe('addSizedPhotoCommand()', () => {
	void it('should published a report and persist it', async () => {
		const id = ulid() as ULID
		const existingReport = testReport()
		const persistMock = mock.fn<PersistReportFn>(async () =>
			Promise.resolve(true),
		)
		const findMock = mock.fn<findReportByIdFn>(async () =>
			Promise.resolve(existingReport),
		)
		const add = addSizedPhotoCommand(findMock, persistMock)

		const adminActorId = testActor()
		const report = await add(
			id,
			Object.keys(existingReport.photos)[0]!,
			{
				[PhotoSize.placeholder]: 'https://example.com/placeholder.jpeg',
				[PhotoSize.thumbnail]: 'https://example.com/thumbnail.jpeg',
				[PhotoSize.scaled]: 'https://example.com/scaled.jpeg',
			},
			adminActorId,
		)

		assert.partialDeepStrictEqual(report, {
			$meta: {
				actorId: adminActorId,
				version: v(2),
			},
			photos: {
				...existingReport.photos,
				[Object.keys(existingReport.photos)[0]!]: {
					[PhotoSize.placeholder]: 'https://example.com/placeholder.jpeg',
					[PhotoSize.thumbnail]: 'https://example.com/thumbnail.jpeg',
					[PhotoSize.scaled]: 'https://example.com/scaled.jpeg',
				},
			},
		})

		const expectedEvent: Partial<SizedPhotoAddedEvent> = {
			eventName: EventNames.SizedPhotoAdded,
			aggregateName: AggregateNames.Report,
			aggregateId: report.$meta.id,
			aggregateVersion: v(2),
			actorId: adminActorId,
			photoId: Object.keys(existingReport.photos)[0]!,
			sizes: {
				[PhotoSize.placeholder]: 'https://example.com/placeholder.jpeg',
				[PhotoSize.thumbnail]: 'https://example.com/thumbnail.jpeg',
				[PhotoSize.scaled]: 'https://example.com/scaled.jpeg',
			},
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

		const add = addSizedPhotoCommand(findMock, persistMock)

		const id = ulid() as ULID
		await assert.rejects(
			async () => {
				await add(
					id,
					'some-photo.jpeg',
					{
						[PhotoSize.placeholder]: 'https://example.com/placeholder.jpeg',
						[PhotoSize.thumbnail]: 'https://example.com/thumbnail.jpeg',
						[PhotoSize.scaled]: 'https://example.com/scaled.jpeg',
					},
					testActor(),
				)
			},
			{
				name: 'NotFoundError',
				message: `Report ${id} not found!`,
			},
		)
	})
})
