import assert from 'node:assert'
import { describe, it } from 'node:test'
import { extractEventsFromDynamoDBEvent } from './extractEventsFromDynamoDBEvent.ts'

void describe('extractEventsFromDynamoDBEvent()', () => {
	void it('should extract events', () => {
		assert.deepEqual(
			extractEventsFromDynamoDBEvent({
				Records: [
					{
						eventID: '2e8c3350216aa57b623003adb62133d1',
						eventName: 'INSERT',
						eventVersion: '1.1',
						eventSource: 'aws:dynamodb',
						awsRegion: 'eu-central-1',
						dynamodb: {
							ApproximateCreationDateTime: 1753035962,
							Keys: {
								eventId: {
									S: '01K0MHBYFJT74K0NHCR72V4265',
								},
								aggregateId: {
									S: '928d0b1d-cab0-4d08-b565-4bdd941eeb7b',
								},
							},
							NewImage: {
								REVERSE_GEO: {
									N: '1011',
								},
								GROUND_FIX: {
									N: '123',
								},
								eventId: {
									S: '01K0MHBYFJT74K0NHCR72V4265',
								},
								aggregateId: {
									S: '928d0b1d-cab0-4d08-b565-4bdd941eeb7b',
								},
								actorId: {
									S: 'actor-2bf6766b-27be-4c65-8b55-d7e6f0d23348',
								},
								AGPS: {
									N: '456',
								},
								aggregateName: {
									S: 'Team',
								},
								eventName: {
									S: 'ProxyUsageConfigured',
								},
								eventTs: {
									S: '2025-07-20T18:26:02.866Z',
								},
								PGPS: {
									N: '789',
								},
								aggregateVersion: {
									N: '3',
								},
							},
							SequenceNumber: '28856700000818875059017386',
							SizeBytes: 345,
							StreamViewType: 'NEW_IMAGE',
						},
						eventSourceARN:
							'arn:aws:dynamodb:eu-central-1:529088254840:table/plans-and-pricing-persistence-eventsTable/stream/2025-07-14T14:22:52.405',
					},
				],
			}),
			[
				{
					REVERSE_GEO: 1011,
					GROUND_FIX: 123,
					eventId: '01K0MHBYFJT74K0NHCR72V4265',
					aggregateId: '928d0b1d-cab0-4d08-b565-4bdd941eeb7b',
					actorId: 'actor-2bf6766b-27be-4c65-8b55-d7e6f0d23348',
					AGPS: 456,
					aggregateName: 'Team',
					eventName: 'ProxyUsageConfigured',
					eventTs: '2025-07-20T18:26:02.866Z',
					PGPS: 789,
					aggregateVersion: 3,
				},
			],
		)
	})
})
