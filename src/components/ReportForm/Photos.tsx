import { useReport } from '#context/Report.tsx'
import { route } from 'preact-router'
import { PhotoGallery } from './PhotoGallery.tsx'
import { PhotoHelp } from './PhotoHelp.tsx'
import { PhotoUpload } from './PhotoUpload.tsx'

export const Photos = () => {
	const { photos, addPhoto, removePhoto, photoLimit } = useReport()
	return (
		<>
			<PhotoHelp limit={photoLimit} />
			{photos.length < photoLimit && <PhotoUpload onImage={addPhoto} />}
			<PhotoGallery photos={photos} removePhoto={removePhoto} />
			<div class="row justify-content-center mt-4">
				<div class="col-12 col-md-8 col-lg-6">
					<p class="d-flex justify-content-between align-items-center">
						<button
							onClick={() => route('/report/location')}
							class="btn btn-outline-secondary"
						>
							Back
						</button>
						<button
							onClick={() => route('/report/description')}
							class="btn btn-primary"
							disabled={photos.length === 0}
						>
							Next
						</button>
					</p>
				</div>
			</div>
		</>
	)
}
