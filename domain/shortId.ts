import type { AggregateMeta } from '../aggregate/AggregateMeta.ts'

export const shortId = ({
	$meta,
}: {
	$meta: Pick<AggregateMeta, 'id'>
}): string => $meta.id.slice(-6)
