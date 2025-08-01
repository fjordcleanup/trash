import type { PhotoSize } from '../../domain/PhotoSize.ts'
import type { TrashType } from '../../domain/TrashType.ts'
import type { AggregateMeta } from './AggregateMeta.ts'

export type SizedPhoto = {
	[PhotoSize.placeholder]: string
	[PhotoSize.thumbnail]: string
	[PhotoSize.scaled]: string
}

export type ReportAggregate = {
	$meta: AggregateMeta
	type: Array<TrashType>
	location: {
		lat: number
		lng: number
	}
	description?: string
	photos: Record<string, null | SizedPhoto>
}
