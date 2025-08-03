import {
	packLambdaFromPath,
	type PackedLambda,
} from '@bifravst/aws-cdk-lambda-helpers'
import { NOTIFICATIONS_STACK_NAME } from '../stacks/stackName.ts'

export type NotificationLambdas = {
	adminReportCreated: PackedLambda
}

export const packLambdas = async (): Promise<NotificationLambdas> => ({
	adminReportCreated: await packLambdaFromPath({
		id: `${NOTIFICATIONS_STACK_NAME}-adminReportCreated`,
		sourceFilePath: 'lambda/notifications/adminReportCreated.ts',
	}),
})
