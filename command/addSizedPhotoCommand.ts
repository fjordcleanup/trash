import { EventNames } from '#event/EventNames.ts'
import type { SizedPhotoAddedEvent } from '#event/SizedPhotoAddedEvent.ts'
import { inc } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import { NotFoundError } from '@coderbyheart/aws-dynamodb-es-cqrs/error'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import { reportReducer } from '../aggregate/reducer/reportReducer.ts'
import type {
	ReportAggregate,
	SizedPhoto,
} from '../aggregate/ReportAggregate.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'

export const addSizedPhotoCommand =
	(findReportById: findReportByIdFn, persistReport: PersistReportFn) =>
	async (
		reportId: ULID,
		photoId: string,
		sizes: SizedPhoto,
		actorId: string,
	): Promise<ReportAggregate> => {
		const maybeReport = await findReportById(reportId)
		if (maybeReport === null) {
			throw new NotFoundError(`Report ${reportId} not found!`)
		}

		const event: SizedPhotoAddedEvent = {
			eventId: ulid() as ULID,
			eventName: EventNames.SizedPhotoAdded,
			aggregateName: AggregateNames.Report,
			aggregateId: maybeReport.$meta.id,
			aggregateVersion: inc(maybeReport.$meta.version),
			actorId,
			photoId,
			sizes,
		}

		const applied = reportReducer([event], maybeReport)

		await persistReport(applied, event)

		return applied
	}
