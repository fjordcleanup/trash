import {
	AdminGetUserCommand,
	CognitoIdentityProviderClient,
	ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'

export const getAdminEmails =
	({
		cognito,
		UserPoolId,
	}: {
		UserPoolId: string
		cognito?: CognitoIdentityProviderClient
	}) =>
	async (): Promise<string[]> => {
		const emails: string[] = []
		cognito = cognito ?? new CognitoIdentityProviderClient({})

		// Get all users in the 'admins' group
		const listUsersCommand = new ListUsersInGroupCommand({
			UserPoolId,
			GroupName: 'admins',
		})

		const response = await cognito.send(listUsersCommand)

		if (response.Users) {
			for (const user of response.Users) {
				const userDetails = await cognito.send(
					new AdminGetUserCommand({
						UserPoolId,
						Username: user.Username,
					}),
				)

				const email = userDetails.UserAttributes?.find(
					(attr) => attr.Name === 'email',
				)?.Value

				if (email === undefined) continue

				emails.push(email)
			}
		}

		return emails
	}
