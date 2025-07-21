import { Redirect } from '#components/Redirect.tsx'
import { Provider as AuthProvider, useAuth } from '#context/Auth.tsx'
import { About } from '#page/About.tsx'
import { Home } from '#page/Home.tsx'
import { Register } from '#page/Register.tsx'
import { Report } from '#page/Report.tsx'
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
				<Route path="/about" component={About} />
				<Route path="/report" component={Register} />
			</Router>
		)
	}

	return (
		<Router>
			<Route path="/" component={Home} />
			<Route path="/about" component={About} />
			<Route path="/report" component={Report} />
			<Redirect path="/auth/callback" to="/" />
		</Router>
	)
}
