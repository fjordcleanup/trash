import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import { inc, type AggregateVersion } from '../aggregate/AggregateVersion.ts'
import { reportReducer } from '../aggregate/reducer/reportReducer.ts'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import { ConflictError } from '../domain/error/ConflictError.ts'
import { NotFoundError } from '../domain/error/NotFoundError.ts'
import type { ULID } from '../event/AggregateEvent.ts'
import { EventNames } from '../event/EventNames.ts'
import type { ReportPublishedEvent } from '../event/ReportPublishedEvent.ts'
import type { findReportByIdFn } from '../persistence/findReportByIdFn.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'

export const publishReportCommand =
	(findReportById: findReportByIdFn, persistReport: PersistReportFn) =>
	async (
		reportId: ULID,
		version: AggregateVersion,
		actorId: string,
	): Promise<ReportAggregate> => {
		const maybeReport = await findReportById(reportId)
		if (maybeReport === null) {
			throw new NotFoundError(`Report ${reportId} not found!`)
		}

		if (maybeReport.$meta.version !== version) {
			throw new ConflictError(
				`Report ${reportId} version mismatch! Expected ${version}, got ${maybeReport.$meta.version}`,
			)
		}

		const event: ReportPublishedEvent = {
			eventId: ulid() as ULID,
			eventName: EventNames.ReportPublished,
			aggregateName: AggregateNames.Report,
			aggregateId: maybeReport.$meta.id,
			aggregateVersion: inc(maybeReport.$meta.version),
			actorId,
		}

		const applied = reportReducer([event], maybeReport)

		await persistReport(applied, event)

		return applied
	}
