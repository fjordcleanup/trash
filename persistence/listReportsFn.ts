import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'

export type listReportsFn = () => Promise<Array<ReportAggregate>>
