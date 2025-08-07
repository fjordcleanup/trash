import type { ULID } from '#event/AggregateEvent.ts'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'

export type findReportByIdFn = (
	reportId: ULID,
) => Promise<ReportAggregate | null>
