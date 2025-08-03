import { Redirect } from '#components/Redirect.tsx'
import { Provider as AuthProvider, useAuth } from '#context/Auth.tsx'
import { Provider as MapSettingsProvider } from '#context/MapSettings.tsx'
import { Provider as ReportsProvider, useReports } from '#context/Reports.tsx'
import { About } from '#page/About.tsx'
import { InstagramShare } from '#page/InstagramShare.tsx'
import { Map } from '#page/Map.tsx'
import { Register } from '#page/Register.tsx'
import { Report } from '#page/Report.tsx'
import { route, Route, Router } from 'preact-router'
import { useEffect } from 'preact/hooks'

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
	const { reports } = useReports()

	useEffect(() => {
		if (reports.length === 0) return
		const hash = window.location.hash.slice(1)
		if (hash.length !== 6) return
		const report = reports.find((r) => r.$meta.id.endsWith(hash))
		if (report !== undefined) {
			route(`/map/${report.$meta.id}`)
		} else {
			route('/')
		}
	}, [reports])

	if (user === undefined) {
		return (
			<Router>
				<Route path="/" component={Map} />
				<Route path="/map" component={Map} />
				<Route path="/map/:reportId" component={Map} />
				<Route path="/about" component={About} />
				<Route path="/report" component={Register} />
				<Route path="/share/:reportId/ig" component={InstagramShare} />
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
			<Route path="/share/:reportId/ig" component={InstagramShare} />
			<Redirect path="/auth/callback" to="/" />
		</Router>
	)
}
