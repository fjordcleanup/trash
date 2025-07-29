import type { TrashType } from '#components/ReportForm.tsx'
import { CircleFadingArrowUp } from 'lucide-preact'
import type { LngLat } from 'maplibre-gl'
import { MiniMap } from './MiniMap.tsx'
import { TrashTypeDiamond } from './TrashTypeDiamond.tsx'

export const Preview = ({
	trashType,
	location,
	description,
	photos,
}: {
	trashType: Array<TrashType>
	location: LngLat
	description: string
	photos: Array<Blob>
}) => (
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
		<div class="row justify-content-center">
			<div class="col-12 col-md-8 col-lg-6 mb-4">
				<div class="card">
					<div class="card-header" style={{ padding: '0' }}>
						<MiniMap markerLocation={location} />
					</div>
					<div class="card-body">
						<div class="row">
							<div class="col-8">
								<p>
									<strong>Description:</strong> {description}
								</p>
								<p>
									<strong>Photos:</strong> {photos.length} uploaded
								</p>
							</div>
							<div class="col-4">
								<TrashTypeDiamond types={trashType} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
)
