import { ArrowDownToDot, LineSquiggle, Section } from 'lucide-preact'

export const PhotoHelp = ({ limit }: { limit: number }) => (
	<div class="row justify-content-center">
		<div class="col-12 col-md-8 col-lg-6 mb-4">
			<p>
				Upload up to {limit} photos of the location where we can find the trash.
			</p>
			<p class="d-flex">
				<ArrowDownToDot class="flex-shrink-0 me-2" size={24} />
				Make sure the photo clearly shows the trash and its surroundings so we
				easily locate it.
			</p>
			<p class="d-flex">
				<LineSquiggle class="flex-shrink-0 me-2" size={24} /> Consider using the
				drawing feature of your photo app to mark the location of the trash if
				it's not easily identifiable.
			</p>
			<p class="d-flex">
				<Section class="flex-shrink-0 me-2" size={24} /> Avoid sharing photos
				that show individuals.
			</p>
		</div>
	</div>
)
