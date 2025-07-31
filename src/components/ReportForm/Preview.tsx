import { TrashCard } from '#components/TrashCard.tsx'
import { useReport } from '#context/Report.tsx'
import { CircleFadingArrowUp } from 'lucide-preact'
import { route } from 'preact-router'
import { useEffect } from 'preact/hooks'

export const Preview = () => {
	const {
		trashType,
		location,
		description,
		photos,
		isValid,
		submitting,
		report,
		reportId,
	} = useReport()

	useEffect(() => {
		if (reportId === undefined) return
		route('/report/thank-you')
	}, [reportId])

	return (
		<>
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6 mb-4">
					<h2 class="fs-2 mb-3 d-flex align-items-center">
						<CircleFadingArrowUp class="flex-shrink-0 me-2" size={24} />
						<span>Summary</span>
					</h2>
					<p>
						Here is a summary of your report. If you are happy, click{' '}
						<em>Report</em>, otherwise you can go back and update your report.
					</p>
				</div>
			</div>
			{location !== undefined && (
				<div class="row justify-content-center">
					<div class="col-12 col-md-8 col-lg-6 mb-4">
						<TrashCard
							description={description}
							location={location}
							photos={photos.map(
								(photo) => new URL(URL.createObjectURL(photo)),
							)}
							trashType={trashType}
						/>
					</div>
				</div>
			)}
			<div class="row justify-content-center mt-4">
				<div class="col-12 col-md-8 col-lg-6">
					<p class="d-flex justify-content-between align-items-center">
						<button
							onClick={() => route('/report/description')}
							class="btn btn-outline-secondary"
						>
							Back
						</button>
						<button
							onClick={() => report()}
							class="btn btn-fjordcleanup"
							disabled={!isValid || submitting}
						>
							{submitting ? 'Submitting...' : 'Report!'}
						</button>
					</p>
				</div>
			</div>
		</>
	)
}
