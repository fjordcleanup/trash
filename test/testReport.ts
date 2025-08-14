import { v1 } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import { TrashType } from '@fjordcleanup/trash-proto'
import { ulid } from 'ulidx'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import { testActor } from './testActor.ts'

export const testReport = (): ReportAggregate => {
	const actorId = testActor()
	return {
		$meta: {
			actorId,
			id: ulid() as ULID,
			version: v1,
		},
		authorId: actorId,
		description:
			"There is an aluminum ship mast on the ground here. It's at least 6 meters long.",
		location: {
			lat: 59.917740637491505,
			lng: 10.671264841123048,
		},
		photos: {
			'photo-1.jpeg': null,
		},
		type: [TrashType.Bulk],
	}
}
