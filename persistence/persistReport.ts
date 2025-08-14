import type { PersistFn } from '@coderbyheart/aws-dynamodb-es-cqrs/persistence'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'

export type PersistReportFn = PersistFn<ReportAggregate>
