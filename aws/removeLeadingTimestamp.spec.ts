import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { removeLeadingTimestamp } from './removeLeadingTimestamp.ts'

void describe('removeLeadingTimestamp()', () => {
	void it('should remove leading timestamp from log message', () =>
		assert.equal(
			removeLeadingTimestamp(
				'2025-08-03T22:13:03.271Z\t0df06f08-7ef6-413b-aabd-2e7a7e3272b3 INFO Original image info: /tmp/e5cffea0-fbf9-44ed-bf64-c0aa3fbae17c JPEG 1080x606 1080x606+0+0 8-bit sRGB 232166B 0.000u 0:00.005',
			),
			'0df06f08-7ef6-413b-aabd-2e7a7e3272b3 INFO Original image info: /tmp/e5cffea0-fbf9-44ed-bf64-c0aa3fbae17c JPEG 1080x606 1080x606+0+0 8-bit sRGB 232166B 0.000u 0:00.005',
		))

	void it('should return message unchanged if no timestamp pattern is found', () => {
		const message = 'Some log message without timestamp'

		assert.equal(removeLeadingTimestamp(message), message)
	})

	void it('should not remove timestamp if it is not at the beginning', () => {
		const message = 'Some prefix 2025-08-03T22:13:03.271Z\trest of message'
		assert.equal(removeLeadingTimestamp(message), message)
	})

	void it('should handle different timestamp formats that do not match the pattern', () => {
		const message = '2025-08-03 22:13:03\tSome message'
		assert.equal(removeLeadingTimestamp(message), message)
	})
})
