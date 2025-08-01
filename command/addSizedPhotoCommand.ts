import { ulid } from 'ulidx'
import type { SizedPhotoAddedEvent } from '../event/SizedPhotoAddedEvent.ts'
import { AggregateNames } from '../persistence/AggregateNames.ts'
import { inc } from '../persistence/aggregate/AggregateVersion.ts'
import type {
	ReportAggregate,
	SizedPhoto,
} from '../persistence/aggregate/ReportAggregate.ts'
import type { ULID } from '../persistence/event/AggregateEvent.ts'
import { EventNames } from '../persistence/event/EventNames.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'
import { reportReducer } from '../persistence/reducer/reportReducer.ts'

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
			throw new Error(`Report ${reportId} not found!`)
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
