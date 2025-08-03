import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import type { PersistFn } from './PersistFn.ts'

export type PersistReportFn = PersistFn<ReportAggregate>
