import { Type } from '@sinclair/typebox'
import type { ULID } from '../../persistence/event/AggregateEvent.ts'

/**
 * Converts a string to an ULID
 */
export const ULIDSchema = Type.Transform(
	Type.RegExp(`^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`, {
		title: 'ULID',
		description:
			'A Universally Unique Lexicographically Sortable Identifier (ULID)',
		examples: ['01K1KZYXZ71X6HTKCWDWH7TJXF'],
	}),
)
	.Decode((value) => value as ULID)
	.Encode((value) => value)
