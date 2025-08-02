import { Map as MapComponent } from '#components/Map.tsx'
import { Navbar } from '#components/Navbar.tsx'
import { TrashCard } from '#components/TrashCard/TrashCard.tsx'
import { useReports } from '#context/Reports.tsx'
import { route } from 'preact-router'
import { useMemo } from 'preact/hooks'

export const Map = (props: { reportId?: string }) => {
	const { reports } = useReports()
	const report = useMemo(
		() => reports.find((r) => r.$meta.id === props.reportId),
		[reports, props.reportId],
	)
	return (
		<>
			<MapComponent onClick={() => route('/map')} />
			<Navbar />
			{report !== undefined && (
				<>
					<main class="container mt-4">
						<div class="row justify-content-center">
							<div class="col-12 col-md-8 col-lg-6 mb-4">
								{report !== undefined && (
									<TrashCard key={report.$meta.id} report={report} />
								)}
							</div>
						</div>
					</main>
				</>
			)}
		</>
	)
}
