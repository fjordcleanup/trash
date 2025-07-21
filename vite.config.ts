import { createConfig } from './vite/config.ts'

export default createConfig({
	domainName: process.env.DOMAIN_NAME ?? 'trash.fjordcleanup.org',
	cognitoUserPoolURL: new URL(
		process.env.COGNITO_USER_POOL_URL ??
			'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_I8tzxRuIa',
	),
	cognitoUserPoolClientId:
		process.env.COGNITO_USER_POOL_CLIENT_ID ?? '129j8n6vtpat0rk0l15sk83kfl',
})
