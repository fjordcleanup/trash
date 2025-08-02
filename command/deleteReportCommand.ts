import { ulid } from 'ulidx'
import type { ReportDeletedEvent } from '../event/ReportDeletedEvent.ts'
import { AggregateNames } from '../persistence/AggregateNames.ts'
import {
	inc,
	type AggregateVersion,
} from '../persistence/aggregate/AggregateVersion.ts'
import type { ReportAggregate } from '../persistence/aggregate/ReportAggregate.ts'
import type { ULID } from '../persistence/event/AggregateEvent.ts'
import { EventNames } from '../persistence/event/EventNames.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'
import { reportReducer } from '../persistence/reducer/reportReducer.ts'

export const deleteReportCommand =
	(findReportById: findReportByIdFn, persistReport: PersistReportFn) =>
	async (
		reportId: ULID,
		version: AggregateVersion,
		actorId: string,
	): Promise<ReportAggregate> => {
		const maybeReport = await findReportById(reportId)
		if (maybeReport === null) {
			throw new Error(`Report ${reportId} not found!`)
		}

		if (maybeReport.$meta.version !== version) {
			throw new Error(
				`Report ${reportId} version mismatch! Expected ${version}, got ${maybeReport.$meta.version}`,
			)
		}

		const event: ReportDeletedEvent = {
			eventId: ulid() as ULID,
			eventName: EventNames.ReportDeleted,
			aggregateName: AggregateNames.Report,
			aggregateId: maybeReport.$meta.id,
			aggregateVersion: inc(maybeReport.$meta.version),
			actorId,
		}

		const applied = reportReducer([event], maybeReport)

		await persistReport(applied, event)

		return applied
	}
