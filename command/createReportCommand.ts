import { ulid } from 'ulidx'
import type { ReportCreatedEvent } from '../event/ReportCreatedEvent.ts'
import { AggregateNames } from '../persistence/AggregateNames.ts'
import { v1 } from '../persistence/aggregate/AggregateVersion.ts'
import type { ReportAggregate } from '../persistence/aggregate/ReportAggregate.ts'
import type { ULID } from '../persistence/event/AggregateEvent.ts'
import { EventNames } from '../persistence/event/EventNames.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'
import { reportReducer } from '../persistence/reducer/reportReducer.ts'

export const createReportCommand =
	(persistReport: PersistReportFn) =>
	async (
		report: Omit<ReportAggregate, '$meta'>,
		actorId: string,
	): Promise<ReportAggregate> => {
		const id = ulid() as ULID
		const event: ReportCreatedEvent = {
			eventId: ulid() as ULID,
			eventName: EventNames.ReportCreated,
			aggregateName: AggregateNames.Report,
			aggregateId: id,
			aggregateVersion: v1,
			actorId,
			...report,
		}

		const applied = reportReducer([event])

		await persistReport(applied, event)

		return applied
	}
