import {
	packLambdaFromPath,
	type PackedLambda,
} from '@bifravst/aws-cdk-lambda-helpers'
import { NOTIFICATIONS_STACK_NAME } from '../stacks/stackName.ts'

export type NotificationLambdas = {
	adminReportCreated: PackedLambda
	userReportPublished: PackedLambda
}

export const packLambdas = async (
	tsConfigFilePath: string,
): Promise<NotificationLambdas> => ({
	adminReportCreated: await packLambdaFromPath({
		id: `${NOTIFICATIONS_STACK_NAME}-adminReportCreated`,
		sourceFilePath: 'lambda/notifications/adminReportCreated.ts',
		tsConfigFilePath,
	}),
	userReportPublished: await packLambdaFromPath({
		id: `${NOTIFICATIONS_STACK_NAME}-userReportPublished`,
		sourceFilePath: 'lambda/notifications/userReportPublished.ts',
		tsConfigFilePath,
	}),
})
