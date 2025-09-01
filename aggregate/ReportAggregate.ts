import type { AggregateMeta } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { TrashType } from '@fjordcleanup/trash-proto'
import type { SizedPhoto } from './SizedPhoto.ts'

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
