import {
	packLambdaFromPath,
	type PackedLambda,
} from '@bifravst/aws-cdk-lambda-helpers'
import { PERSISTENCE_STACK_NAME } from '../stackName.ts'

export type PersistenceLambdas = {
	resizePhotos: PackedLambda
}

export const packLambdas = async (): Promise<PersistenceLambdas> => ({
	resizePhotos: await packLambdaFromPath({
		id: `${PERSISTENCE_STACK_NAME}-resizePhotos`,
		sourceFilePath: 'lambda/resizePhotos.ts',
	}),
})
