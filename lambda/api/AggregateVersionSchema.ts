import { Type } from '@sinclair/typebox'
import type { AggregateVersion } from '../../persistence/aggregate/AggregateVersion.ts'

export const AggregateVersionSchema = Type.Transform(
	Type.Integer({
		minimum: 1,
		title: 'AggregateVersion',
		description: 'The version of an aggregate.',
		examples: [1, 2, 42],
	}),
)
	.Decode((value) => value as AggregateVersion)
	.Encode((value) => value)
