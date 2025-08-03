import type { PhotoSize } from '../domain/PhotoSize.ts'
import type { TrashType } from '../domain/TrashType.ts'
import type { AggregateMeta } from './AggregateMeta.ts'

export type SizedPhoto = {
	[PhotoSize.placeholder]: string
	[PhotoSize.thumbnail]: string
	[PhotoSize.scaled]: string
}

export type ReportAggregate = {
	$meta: AggregateMeta
	authorId: string
	type: Array<TrashType>
	location: {
		lat: number
		lng: number
	}
	description?: string
	photos: Record<string, null | SizedPhoto>
	// The report is public and can be viewed by anyone
	isPublic?: boolean
	// The report is deleted and should not be shown
	isDeleted?: boolean
}
