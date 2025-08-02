import { fromEnv } from '@bifravst/from-env'
import { createConfig } from './vite/config.ts'

const {
	cognitoUserPoolURL,
	cognitoIdentityPoolId,
	cognitoUserPoolClientId,
	mapAPIKey,
	awsRegion,
} = fromEnv({
	cognitoUserPoolURL: 'COGNITO_USER_POOL_URL',
	cognitoIdentityPoolId: 'COGNITO_IDENTITY_POOL_ID',
	cognitoUserPoolClientId: 'COGNITO_USER_POOL_CLIENT_ID',
	mapAPIKey: 'MAP_API_KEY',
	awsRegion: 'AWS_REGION',
})(process.env)

export default createConfig({
	cognitoUserPoolURL: new URL(cognitoUserPoolURL),
	cognitoUserPoolClientId,
	cognitoIdentityPoolId,
	mapAPIKey,
	awsRegion,
})
