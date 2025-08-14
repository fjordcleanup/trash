import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'

export type findReportByIdFn = (
	reportId: ULID,
) => Promise<ReportAggregate | null>
