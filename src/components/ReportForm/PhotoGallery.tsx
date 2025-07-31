import { Trash2 } from 'lucide-preact'

export const PhotoGallery = ({
	photos,
	removePhoto = () => {},
}: {
	photos: Blob[]
	removePhoto?: (index: number) => void
}) => (
	<div class="row justify-content-center mb-4">
		<div class="col-12 col-md-8 col-lg-6">
			<h3>Selected Photos</h3>
			{photos.length === 0 ? (
				<p>No photos selected</p>
			) : (
				<div class="row">
					{photos.map((photo, index) => (
						<div class="col-6" key={index}>
							<button
								class="btn btn-outline-danger mt-2 d-flex align-items-center"
								onClick={() => removePhoto(index)}
							>
								<Trash2 class="me-1" />
								<span>Remove</span>
							</button>
							<br />
							<img
								src={URL.createObjectURL(photo)}
								alt={`Photo ${index + 1}`}
								class="img-fluid"
							/>
						</div>
					))}
				</div>
			)}
		</div>
	</div>
)
