import { fromEnv } from '@bifravst/from-env'
import { createConfig } from './vite/config.ts'

const { cognitoUserPoolURL, cognitoUserPoolClientId, mapAPIKey, awsRegion } =
	fromEnv({
		cognitoUserPoolURL: 'COGNITO_USER_POOL_URL',
		cognitoUserPoolClientId: 'COGNITO_USER_POOL_CLIENT_ID',
		mapAPIKey: 'MAP_API_KEY',
		awsRegion: 'AWS_REGION',
	})(process.env)

export default createConfig({
	cognitoUserPoolURL: new URL(cognitoUserPoolURL),
	cognitoUserPoolClientId,
	mapAPIKey,
	awsRegion,
})
