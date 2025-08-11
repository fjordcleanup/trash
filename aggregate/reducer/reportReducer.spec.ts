import { PhotoSize } from '#domain/PhotoSize.ts'
import { TrashType } from '#domain/TrashType.ts'
import type { ULID } from '#event/AggregateEvent.ts'
import { EventNames } from '#event/EventNames.ts'
import type { ReportCreatedEvent } from '#event/ReportCreatedEvent.ts'
import type { ReportDeletedEvent } from '#event/ReportDeletedEvent.ts'
import type { ReportPublishedEvent } from '#event/ReportPublishedEvent.ts'
import type { SizedPhotoAddedEvent } from '#event/SizedPhotoAddedEvent.ts'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ulid } from 'ulidx'
import { testActor } from '../../test/testActor.ts'
import type { ReportAggregate } from '../ReportAggregate.ts'
import { reportReducer } from './reportReducer.ts'

const aggregateName = 'Report'

const createReportCreatedEvent = (): ReportCreatedEvent => ({
	// AggregateEvent fields
	eventId: ulid() as ULID,
	eventName: EventNames.ReportCreated,
	aggregateName,
	aggregateId: ulid() as ULID,
	aggregateVersion: 1 as any,
	actorId: testActor(),
	// ReportCreatedEvent specific
	type: [TrashType.Litter],
	location: { lat: 1, lng: 2 },
	description: 'A description',
	photos: { 'p1.jpg': null },
})

const createSizedPhotoAddedEvent = (
	aggregate: ReportAggregate,
	overrides: Partial<SizedPhotoAddedEvent> = {},
): SizedPhotoAddedEvent => ({
	eventId: ulid() as ULID,
	eventName: EventNames.SizedPhotoAdded,
	aggregateName,
	aggregateId: overrides.aggregateId ?? aggregate.$meta.id,
	aggregateVersion: 2 as any,
	actorId: overrides.actorId ?? testActor(),
	photoId: overrides.photoId ?? 'new-photo.jpg',
	sizes: overrides.sizes ?? {
		[PhotoSize.placeholder]: 'placeholder-url',
		[PhotoSize.thumbnail]: 'thumb-url',
		[PhotoSize.scaled]: 'scaled-url',
	},
})

const createReportDeletedEvent = (
	aggregate: ReportAggregate,
	overrides: Partial<ReportDeletedEvent> = {},
): ReportDeletedEvent => ({
	eventId: ulid() as ULID,
	eventName: EventNames.ReportDeleted,
	aggregateName,
	aggregateId: overrides.aggregateId ?? aggregate.$meta.id,
	aggregateVersion: 2 as any,
	actorId: overrides.actorId ?? testActor(),
})

const createReportPublishedEvent = (
	aggregate: ReportAggregate,
): ReportPublishedEvent => ({
	eventId: ulid() as ULID,
	eventName: EventNames.ReportPublished,
	aggregateName,
	aggregateId: aggregate.$meta.id,
	aggregateVersion: 2 as any,
	actorId: testActor(),
})

void describe('reportReducer()', () => {
	void it('should build a report aggregate from ReportCreated', () => {
		const created = createReportCreatedEvent()
		const report = reportReducer([created])
		assert.equal(report.authorId, created.actorId)
		assert.equal(report.$meta.id, created.aggregateId)
		assert.equal(report.$meta.version, 1)
		assert.deepEqual(report.photos, created.photos)
	})

	void it('should add sized photo to existing aggregate', () => {
		const created = createReportCreatedEvent()
		const sized = createSizedPhotoAddedEvent(reportReducer([created]))
		const report = reportReducer([created, sized])
		assert.ok(report.photos[sized.photoId])
		assert.equal(
			report.photos[sized.photoId]?.[PhotoSize.thumbnail],
			'thumb-url',
		)
		assert.equal(report.$meta.version, 2)
		assert.ok(report.$meta.updatedAt instanceof Date)
	})

	void it('should delete a report', () => {
		const created = createReportCreatedEvent()
		const agg1 = reportReducer([created])
		const deleted = createReportDeletedEvent(agg1)
		const report = reportReducer([created, deleted])
		assert.equal(report.isDeleted, true)
		assert.equal(report.$meta.version, 2)
	})

	void it('should publish a report', () => {
		const created = createReportCreatedEvent()
		const agg1 = reportReducer([created])
		const published = createReportPublishedEvent(agg1)
		const report = reportReducer([created, published])
		assert.equal(report.isPublic, true)
		assert.equal(report.$meta.version, 2)
	})

	void it('should throw when applying SizedPhotoAdded without existing aggregate', () => {
		const created = createReportCreatedEvent()
		const agg1 = reportReducer([created])
		const sized = createSizedPhotoAddedEvent(agg1)
		// Break by removing the create event
		assert.throws(() => reportReducer([sized as any]), /requires an aggregate/)
	})

	void it('should throw when applying event for different aggregate id', () => {
		const created = createReportCreatedEvent()
		const report = reportReducer([created])
		const wrongDeleted = createReportDeletedEvent(report, {
			aggregateId: ulid() as ULID,
		})
		assert.throws(
			() => reportReducer([created, wrongDeleted]),
			/targets different aggregate/,
		)
	})

	void it('should increment version for each subsequent event', () => {
		const created = createReportCreatedEvent()
		const agg1 = reportReducer([created])
		const sized1 = createSizedPhotoAddedEvent(agg1, { photoId: 'p2.jpg' })
		const sized2 = createSizedPhotoAddedEvent(agg1, { photoId: 'p3.jpg' })
		const report = reportReducer([created, sized1, sized2])
		assert.equal(report.$meta.version, 3)
		assert.ok(report.photos['p2.jpg'])
		assert.ok(report.photos['p3.jpg'])
	})
})
