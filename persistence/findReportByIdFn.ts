import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import type { ULID } from '../event/AggregateEvent.ts'

export type findReportByIdFn = (
	reportId: ULID,
) => Promise<ReportAggregate | null>
