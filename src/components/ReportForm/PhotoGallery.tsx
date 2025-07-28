export const PhotoGallery = ({
	photos,
	removePhoto,
}: {
	photos: Blob[]
	removePhoto: (index: number) => void
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
							<img
								src={URL.createObjectURL(photo)}
								alt={`Photo ${index + 1}`}
								class="img-fluid"
							/>
							<br />
							<button
								class="btn btn-danger mt-2"
								onClick={() => removePhoto(index)}
							>
								Remove
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	</div>
)
