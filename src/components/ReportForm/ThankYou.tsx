import { useReport } from '#context/Report.tsx'
import { Sparkles } from 'lucide-preact'
import { route } from 'preact-router'

export const ThankYou = () => {
	const { reportId } = useReport()
	return (
		<>
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6">
					<h2 class="fs-2 mb-3 d-flex flex-colum">
						<span>
							<Sparkles class="flex-shrink-0 me-2" size={24} />
							<span>Thank you!</span>
							<br />
						</span>
						<small>
							for helping making the Oslo fjord and Akerselva cleaner!
						</small>
					</h2>
					<p>We will review your report and publish it as soon as possible.</p>
					<p>
						You can follow the progress of your report using this URL:{' '}
						<a href={`/map/${reportId}`}>
							{window.location.origin}/map/{reportId}
						</a>
					</p>
					<p>
						You can also view all reports on the <a href="/">home page</a>.
					</p>
					<p>
						If you have any feedback or questions, please do not hesitate to{' '}
						<a href="/about">reach out</a>.
					</p>
				</div>
			</div>
			<div class="row justify-content-center mt-4">
				<div class="col-12 col-md-8 col-lg-6">
					<p class="d-flex align-items-center">
						<button
							onClick={() => route('/report')}
							class="btn btn-outline-secondary"
						>
							Report more trash
						</button>
					</p>
				</div>
			</div>
		</>
	)
}
