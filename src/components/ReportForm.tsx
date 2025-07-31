import { Route, Router } from 'preact-router'
import { Description } from './ReportForm/Description.tsx'
import { Photos } from './ReportForm/Photos.tsx'
import { Preview } from './ReportForm/Preview.tsx'
import { SelectLocation } from './ReportForm/SelectLocation.tsx'
import { Start } from './ReportForm/Start.tsx'
import { ThankYou } from './ReportForm/ThankYou.tsx'

export const ReportForm = () => (
	<main class="container mt-4">
		<Router>
			<Route path="/report" component={Start} />
			<Route path="/report/location" component={SelectLocation} />
			<Route path="/report/photos" component={Photos} />
			<Route path="/report/description" component={Description} />
			<Route path="/report/preview" component={Preview} />
			<Route path="/report/thank-you" component={ThankYou} />
		</Router>
	</main>
)
