import { useReport } from '#context/Report.tsx'
import { Flag, Pointer, Waves } from 'lucide-preact'
import { route } from 'preact-router'

export const Start = () => {
	const { clear } = useReport()

	return (
		<>
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6">
					<h1 class="text-dark fs-1 mb-3">
						Report trash
						<br />
						<small>to Fjord CleanUP</small>
					</h1>
					<p>Thank you for helping the Oslo fjord and Akerselva cleaner.</p>
					<h2 class="fs-4 mb-3 d-flex align-items-center">
						<Waves class="flex-shrink-0 me-2" size={24} />
						<span>Only report trash in water bodies</span>
					</h2>
					<p>
						Note that we only accept reports for locations for trash that is in
						water bodies, such as the Oslo fjord, or Akerselva. If you found
						trash on land, please use{' '}
						<a href="https://www.fiksgatami.no/" target="_blank">
							fiksgatami.no
						</a>
						.
					</p>
					<h2 class="fs-4 mb-3 d-flex align-items-center">
						<Flag class="flex-shrink-0 me-2" size={24} />
						<span>Only report one location at a time</span>
					</h2>
					<p>
						If you want to report multiple locations, please submit a separate
						report for each location.
					</p>

					<h2 class="fs-4 mb-3 d-flex align-items-center">
						<Pointer class="flex-shrink-0 me-2" size={24} />
						<span>How to report</span>
					</h2>
					<p>
						This form will guide you through the process of reporting trash in
						the Oslo fjord or Akerselva. You will be asked to select a location
						on the map where you found the trash, upload a photo of the trash,
						and provide some additional information about the trash that will
						help us to clean it up.
					</p>
				</div>
			</div>
			<div class="row justify-content-center mt-4">
				<div class="col-12 col-md-8 col-lg-6">
					<p class="d-flex justify-content-end align-items-center">
						<button
							onClick={() => {
								clear()
								route('/report/location')
							}}
							class="btn btn-primary"
						>
							Get started
						</button>
					</p>
				</div>
			</div>
		</>
	)
}
