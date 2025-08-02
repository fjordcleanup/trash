import { UserManager, type User as OIDCUser } from 'oidc-client-ts'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'

// create a UserManager instance
const loginRedirectURL = new URL(
	document.location.protocol + '//' + document.location.host + '/auth/callback',
)
const logoutRedirectURL = new URL(
	document.location.protocol + '//' + document.location.host + '/',
)
const userManager = new UserManager({
	authority: COGNITO_USER_POOL_URL,
	client_id: COGNITO_USER_POOL_CLIENT_ID,
	redirect_uri: loginRedirectURL.toString(),
	scope: 'email openid profile',
})

export const AuthContext = createContext<{
	logout: () => void
	login: () => void
	user?: OIDCUser
	isAdmin: boolean
}>({
	logout: () => undefined,
	login: () => undefined,
	isAdmin: false,
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [oidcUser, setOIDCUser] = useState<undefined | OIDCUser>()

	const isAdmin = useMemo(
		() =>
			(
				oidcUser?.profile['cognito:groups'] as Array<string> | undefined
			)?.includes('admins') ?? false,
		[oidcUser],
	)

	useEffect(() => {
		console.debug(`[Auth]`, `Checking user session...`)
		userManager
			.signinCallback()
			.then((maybeUser) => {
				console.debug(`[Auth]`, `Signin callback processed successfully`)
				if (maybeUser !== undefined) {
					console.debug(`[Auth]`, `User session found:`, maybeUser)
					setOIDCUser(maybeUser)
				}
			})
			.catch(async () => {
				// If signinCallback fails, it means we are not in a redirect callback
				console.debug(
					`[Auth]`,
					`No signin callback found, checking user session...`,
				)
				return userManager
					.getUser()
					.then(async (maybeUser) => {
						if (maybeUser !== null) {
							console.debug(`[Auth]`, `User session found:`, maybeUser)
							setOIDCUser(maybeUser)
							return
						}
						console.debug(
							`[Auth]`,
							`No user session found, trying silent login...`,
						)
						return userManager
							.signinSilent()
							.then(async (maybeUser) => {
								if (maybeUser !== null) {
									console.debug(
										`[Auth]`,
										`User session found via silent login:`,
										maybeUser,
									)
									setOIDCUser(maybeUser)
									return
								}
							})
							.catch(async () => {
								console.debug(`[Auth]`, `Silent login failed`)
							})
					})
					.catch((err) => {
						console.error(`[Auth]`, `Failed to get user session`, err)
					})
			})
	}, [])

	return (
		<AuthContext.Provider
			value={{
				logout: () => {
					console.debug(`[Auth]`, `Redirecting to logout...`)
					userManager
						.signoutRedirect({
							extraQueryParams: {
								client_id: userManager.settings.client_id,
								logout_uri: logoutRedirectURL.toString(),
							},
						})
						.then(() => {
							setOIDCUser(undefined)
							console.debug(`[Auth]`, `Redirected to logout`)
						})
						.catch((err) => {
							console.error(`[Auth]`, `Failed to redirect to logout`, err)
						})
				},
				login: () => {
					userManager
						.signinRedirect()
						.then(() => {
							console.debug(`[Auth]`, `Redirected to login`)
						})
						.catch((err) => {
							console.error(`[Auth]`, `Failed to redirect to login`, err)
						})
				},
				user: oidcUser,
				isAdmin,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const Consumer = AuthContext.Consumer

export const useAuth = () => useContext(AuthContext)
