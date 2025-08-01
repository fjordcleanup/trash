import { Redirect } from '#components/Redirect.tsx'
import { Provider as AuthProvider, useAuth } from '#context/Auth.tsx'
import { Provider as MapSettingsProvider } from '#context/MapSettings.tsx'
import { Provider as ReportsProvider } from '#context/Reports.tsx'
import { About } from '#page/About.tsx'
import { Home } from '#page/Home.tsx'
import { Register } from '#page/Register.tsx'
import { Report } from '#page/Report.tsx'
import { ShowReport } from '#page/ShowReport.tsx'
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
				<Route path="/" component={Home} />
				<Route path="/about" component={About} />
				<Route path="/report" component={Register} />
				<Route path="/map/:reportId" component={ShowReport} />
			</Router>
		)
	}

	return (
		<Router>
			<Route path="/" component={Home} />
			<Route path="/about" component={About} />
			<Route path="/report/:rest*" component={Report} />
			<Route path="/map/:reportId" component={ShowReport} />
			<Redirect path="/auth/callback" to="/" />
		</Router>
	)
}
