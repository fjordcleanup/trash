import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { extractEventsFromDynamoDBEvent } from './extractEventsFromDynamoDBEvent.ts'

void describe('extractEventsFromDynamoDBEvent()', () => {
	void it('should extract events', () => {
		assert.deepEqual(
			extractEventsFromDynamoDBEvent({
				Records: [
					{
						eventID: '4613b0adf71aa7f4602fcccfcba70e4c',
						eventName: 'INSERT',
						eventVersion: '1.1',
						eventSource: 'aws:dynamodb',
						awsRegion: 'eu-north-1',
						dynamodb: {
							ApproximateCreationDateTime: 1754259181,
							Keys: {
								eventId: {
									S: '01K1RZXKEYCYQ5MSEQJ4Z5JNDE',
								},
								aggregateId: {
									S: '01K1RZXKEWDX1ESHFJVDHDWM2E',
								},
							},
							NewImage: {
								eventId: {
									S: '01K1RZXKEYCYQ5MSEQJ4Z5JNDE',
								},
								aggregateId: {
									S: '01K1RZXKEWDX1ESHFJVDHDWM2E',
								},
								actorId: {
									S: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_I8tzxRuIa:805c098c-4061-7008-104e-3cd6d870a7ab',
								},
								aggregateName: {
									S: 'Report',
								},
								description: {
									S: "There is an aluminum ship mast on the ground here. It's at least 6 meters long.",
								},
								eventName: {
									S: 'ReportCreated',
								},
								location: {
									M: {
										lng: {
											N: '10.671264841123048',
										},
										lat: {
											N: '59.917740637491505',
										},
									},
								},
								type: {
									L: [
										{
											S: 'bulk',
										},
									],
								},
								eventTs: {
									S: '2025-08-03T22:13:01.022Z',
								},
								photos: {
									M: {
										'photo-1.jpeg': {
											NULL: true,
										},
									},
								},
								aggregateVersion: {
									N: '1',
								},
							},
							SequenceNumber: '13999900001232806120223146',
							SizeBytes: 503,
							StreamViewType: 'NEW_IMAGE',
						},
						eventSourceARN:
							'arn:aws:dynamodb:eu-north-1:322276017280:table/fjordcleanup-trash-persistence-eventsTable/stream/2025-07-31T22:21:46.510',
					},
				],
			}),
			[
				{
					actorId:
						'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_I8tzxRuIa:805c098c-4061-7008-104e-3cd6d870a7ab',
					aggregateId: '01K1RZXKEWDX1ESHFJVDHDWM2E',
					aggregateName: 'Report',
					aggregateVersion: 1,
					description:
						"There is an aluminum ship mast on the ground here. It's at least 6 meters long.",
					eventId: '01K1RZXKEYCYQ5MSEQJ4Z5JNDE',
					eventName: 'ReportCreated',
					eventTs: '2025-08-03T22:13:01.022Z',
					location: {
						lng: 10.671264841123048,
						lat: 59.917740637491505,
					},
					type: ['bulk'],
					photos: {
						'photo-1.jpeg': null,
					},
				},
			],
		)
	})
})
