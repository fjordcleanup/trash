export type CognitoClaims = {
	claims: {
		/**
		 * Cognito UserPool sub
		 * @example 'a47494a2-8f1e-435b-86b8-ac5f4de69201'
		 */
		sub: string
		/**
		 * Issuer
		 *
		 * @example 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_8S0NTDCkF'
		 */
		iss: string
		/**
		 * Cognito username
		 *
		 * @example 'a47494a2-8f1e-435b-86b8-ac5f4de69201'
		 */
		'cognito:username': string
		/**
		 * Email
		 *
		 * @example 'alex@example.com'
		 */
		email: string
	}
}
