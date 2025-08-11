import type { ULID } from '#event/AggregateEvent.ts'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ulid } from 'ulidx'
import { shortId } from './shortId.ts'

void describe('shortId()', () => {
	void it('should return the last 6 characters of the id', () => {
		const id = ulid() as ULID
		const result = shortId({ $meta: { id } })
		assert.equal(result, id.slice(-6))
	})
})
