import { Navbar } from '#components/Navbar.tsx'
import { ReportForm } from '#components/ReportForm.tsx'
import { Provider as ReportProvider } from '#context/Report.tsx'

export const Report = () => (
	<>
		<Navbar />
		<ReportProvider>
			<ReportForm />
		</ReportProvider>
	</>
)
