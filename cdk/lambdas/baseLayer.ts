import {
	packLayer,
	type PackedLayer,
} from '@bifravst/aws-cdk-lambda-helpers/layer'
import pJson from '../../package.json' with { type: 'json' }

const dependencies: Array<keyof (typeof pJson)['dependencies']> = [
	'@bifravst/from-env',
	'@middy/core',
	'@middy/input-output-logger',
	'@sinclair/typebox',
	'ulidx',
	'@hello.nrfcloud.com/lambda-helpers',
	'@fjordcleanup/trash-proto',
	'@coderbyheart/aws-dynamodb-es-cqrs',
]

export const pack = async (): Promise<PackedLayer> =>
	packLayer({ id: 'baseLayer', dependencies })
