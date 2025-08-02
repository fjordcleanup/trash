import {
	packLambdaFromPath,
	type PackedLambda,
} from '@bifravst/aws-cdk-lambda-helpers'
import { PUBLIC_API_STACK_NAME } from '../stacks/stackName.ts'

export type UserLambdas = {
	submitReport: PackedLambda
	listReports: PackedLambda
	deleteReport: PackedLambda
	publishReport: PackedLambda
}

export const packLambdas = async (): Promise<UserLambdas> => ({
	submitReport: await packLambdaFromPath({
		id: `${PUBLIC_API_STACK_NAME}-submitReport`,
		sourceFilePath: 'lambda/submitReport.ts',
	}),
	listReports: await packLambdaFromPath({
		id: `${PUBLIC_API_STACK_NAME}-listReports`,
		sourceFilePath: 'lambda/listReports.ts',
	}),
	deleteReport: await packLambdaFromPath({
		id: `${PUBLIC_API_STACK_NAME}-deleteReport`,
		sourceFilePath: 'lambda/deleteReport.ts',
	}),
	publishReport: await packLambdaFromPath({
		id: `${PUBLIC_API_STACK_NAME}-publishReport`,
		sourceFilePath: 'lambda/publishReport.ts',
	}),
})
