export const STACK_PREFIX = process.env.STACK_PREFIX ?? 'fjordcleanup-trash'
export const HOSTING_STACK_NAME =
	process.env.STACK_NAME ?? `${STACK_PREFIX}-hosting`
export const APP_DOMAIN_CERTIFICATE_STACK_NAME = `${STACK_PREFIX}-domain-cert`
export const CD_STACK_NAME = `${STACK_PREFIX}-cd`
export const COGNITO_STACK_NAME = `${STACK_PREFIX}-cognito`
export const ACCOUNT_DOMAIN_CERTIFICATE_STACK_NAME = `${STACK_PREFIX}-account-domain-cert`
export const ACCOUNT_STACK_NAME = `${STACK_PREFIX}-account`
