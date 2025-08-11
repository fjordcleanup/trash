import type { ULID } from '#event/AggregateEvent.ts'
import type { GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { ulid } from 'ulidx'
import { testActor } from '../../test/testActor.ts'
import { findReportByIdDynamoDB } from './findReportByIdDynamoDB.ts'

void describe('findReportByIdDynamoDB()', () => {
	void it('should return null when the aggregate is not found', async () => {
		const sendMock = mock.fn<
			(args: { input: GetItemCommandInput }) => Promise<any>
		>(async () => ({ Item: undefined }))

		const find = findReportByIdDynamoDB(
			{ send: sendMock } as any,
			'test-aggregates-table',
		)

		const id = ulid() as ULID
		const result = await find(id)

		assert.equal(result, null)

		const { TableName, Key } = sendMock.mock.calls[0]!.arguments[0].input
		assert.equal(TableName, 'test-aggregates-table')
		assert.deepEqual(Key, marshall({ aggregateId: id }))
	})

	void it('should return the unmarshalled ReportAggregate when found', async () => {
		const id = ulid() as ULID
		const updatedAt = '2024-01-02T03:04:05.678Z'
		const actorId = testActor()

		const persisted = {
			aggregateId: id,
			version: 3,
			actorId: testActor(),
			updatedAt,
			authorId: actorId,
			type: ['bulk'],
			location: { lat: 59.9, lng: 10.7 },
			description: 'A test report',
			photos: { 'photo-1.jpg': null },
			isPublic: true,
			isDeleted: false,
		}

		const sendMock = mock.fn<
			(args: { input: GetItemCommandInput }) => Promise<any>
		>(async () => ({
			Item: marshall(persisted),
		}))

		const find = findReportByIdDynamoDB(
			{ send: sendMock } as any,
			'test-aggregates-table',
		)

		const result = await find(id)

		assert.deepEqual(result, {
			$meta: {
				id,
				version: 3,
				actorId: persisted.actorId,
				updatedAt: new Date(updatedAt),
			},
			authorId: persisted.authorId,
			type: ['bulk'],
			location: { lat: 59.9, lng: 10.7 },
			description: 'A test report',
			photos: { 'photo-1.jpg': null },
			isPublic: true,
			isDeleted: false,
		})

		const { TableName, Key } = sendMock.mock.calls[0]!.arguments[0].input
		assert.equal(TableName, 'test-aggregates-table')
		assert.deepEqual(Key, marshall({ aggregateId: id }))
	})
})
