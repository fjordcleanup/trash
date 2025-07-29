import { TrashCard } from '#components/TrashCard.tsx'
import { CircleFadingArrowUp } from 'lucide-preact'
import type { LngLat } from 'maplibre-gl'
import type { TrashType } from '../../api/TrashType.ts'

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
				<TrashCard
					description={description}
					location={location}
					photos={photos.map((photo) => new URL(URL.createObjectURL(photo)))}
					trashType={trashType}
				/>
			</div>
		</div>
	</>
)
