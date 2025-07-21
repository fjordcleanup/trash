import { Redirect } from '#components/Redirect.tsx'
import { Provider as AuthProvider, useAuth } from '#context/Auth.tsx'
import { Home } from '#page/Home.tsx'
import { Route, Router } from 'preact-router'

export const App = () => (
	<AuthProvider>
		<Routing />
	</AuthProvider>
)

export const Routing = () => {
	const { user } = useAuth()
	if (user === undefined) {
		return (
			<Router>
				<Route path="/" component={Home} />
			</Router>
		)
	}

	return (
		<Router>
			<Route path="/" component={Home} />
			<Redirect path="/auth/callback" to="/" />
		</Router>
	)
}
