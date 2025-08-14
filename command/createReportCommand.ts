import { EventNames } from '#event/EventNames.ts'
import type { ReportCreatedEvent } from '#event/ReportCreatedEvent.ts'
import { v1 } from '@coderbyheart/aws-dynamodb-es-cqrs/aggregate'
import type { ULID } from '@coderbyheart/aws-dynamodb-es-cqrs/event'
import { ulid } from 'ulidx'
import { AggregateNames } from '../aggregate/AggregateNames.ts'
import { reportReducer } from '../aggregate/reducer/reportReducer.ts'
import type { ReportAggregate } from '../aggregate/ReportAggregate.ts'
import type { PersistReportFn } from '../persistence/persistReport.ts'

export const createReportCommand =
	(persistReport: PersistReportFn) =>
	async (
		data: Omit<ReportAggregate, '$meta' | 'authorId'>,
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
			...data,
		}

		const applied = reportReducer([event])

		await persistReport(applied, event)

		return applied
	}
