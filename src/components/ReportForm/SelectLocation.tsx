import { ReportMap } from '#components/ReportMap.tsx'
import { useReport } from '#context/Report.tsx'
import { LocateFixed, MapPin } from 'lucide-preact'
import { route } from 'preact-router'
import { LocationLinks } from '../LocationLinks.tsx'

export const SelectLocation = () => {
	const { location, setLocation } = useReport()

	return (
		<>
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6">
					<h1 class="fs-2 mb-3 d-flex align-items-center">
						<LocateFixed class="flex-shrink-0 me-2" size={24} />
						<span>Mark the spot</span>
					</h1>
					<p>
						Click on the map to select a location where you found trash. You can
						drag the marker to adjust the position if needed.
					</p>
				</div>
			</div>
			<div class="row justify-content-center mb-2">
				<div class="col-12 col-md-8">
					<ReportMap
						onClick={(lngLat) => {
							setLocation(lngLat)
						}}
						markerLocation={location}
					/>
				</div>
			</div>

			{location !== undefined && (
				<>
					<div class="row  justify-content-center">
						<div class="col-12 col-md-8 col-lg-6">
							<h3 class="text-dark fs-3 mb-3 mt-4">Selected location</h3>
						</div>
					</div>
					<div class="row justify-content-center">
						<div class="col-12 col-md-8 col-lg-6">
							<p class="d-flex align-items-center">
								<MapPin class="flex-shrink-0 me-1" size={24} />
								{location.lat},{location.lng}
							</p>
							<p>
								<span class="me-2">View location on:</span>
								<LocationLinks location={location} />
							</p>
						</div>
					</div>
				</>
			)}
			<div class="row justify-content-center mt-4">
				<div class="col-12 col-md-8 col-lg-6">
					<p class="d-flex justify-content-between align-items-center">
						<button
							onClick={() => route('/report')}
							class="btn btn-outline-secondary"
						>
							Start over
						</button>
						<button
							onClick={() => route('/report/photos')}
							class="btn btn-primary"
							disabled={location === undefined}
						>
							Use this location
						</button>
					</p>
				</div>
			</div>
		</>
	)
}
