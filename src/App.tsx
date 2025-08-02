import { Redirect } from '#components/Redirect.tsx'
import { Provider as AuthProvider, useAuth } from '#context/Auth.tsx'
import { Provider as MapSettingsProvider } from '#context/MapSettings.tsx'
import { Provider as ReportsProvider } from '#context/Reports.tsx'
import { About } from '#page/About.tsx'
import { Map } from '#page/Map.tsx'
import { Register } from '#page/Register.tsx'
import { Report } from '#page/Report.tsx'
import { Route, Router } from 'preact-router'

export const App = () => (
	<AuthProvider>
		<MapSettingsProvider>
			<ReportsProvider>
				<Routing />
			</ReportsProvider>
		</MapSettingsProvider>
	</AuthProvider>
)

export const Routing = () => {
	const { user } = useAuth()
	if (user === undefined) {
		return (
			<Router>
				<Route path="/" component={Map} />
				<Route path="/map" component={Map} />
				<Route path="/map/:reportId" component={Map} />
				<Route path="/about" component={About} />
				<Route path="/report" component={Register} />
			</Router>
		)
	}

	return (
		<Router>
			<Route path="/" component={Map} />
			<Route path="/map" component={Map} />
			<Route path="/map/:reportId" component={Map} />
			<Route path="/about" component={About} />
			<Route path="/report/:rest*" component={Report} />
			<Redirect path="/auth/callback" to="/" />
		</Router>
	)
}
