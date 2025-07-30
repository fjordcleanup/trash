import { useAuth } from '#context/Auth.tsx'
import type { LngLat } from 'maplibre-gl'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import type { TrashType } from '../../api/TrashType.ts'

export const Submit = ({
	trashType,
	location,
	description,
	photos,
}: {
	trashType: Array<TrashType>
	location: LngLat
	description: string
	photos: Array<Blob>
}) => {
	const { user } = useAuth()
	const [uploadURLs, setUploadURLs] = useState<Array<string>>()
	const [submitting, setSubmitting] = useState(true)
	const [uploaded, setUploaded] = useState<Array<string>>([])
	const [reportId, setReportId] = useState<string>()

	useEffect(() => {
		if (user?.id_token === undefined) return

		fetch(new URL('https://api.fjordcleanup.org/2025-08-01/report'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${user.id_token}`,
			},
			body: JSON.stringify({
				type: trashType,
				location: {
					lat: location.lat,
					lng: location.lng,
				},
				description,
				numPhotos: photos.length,
			}),
		})
			.then(async (res) => res.json())
			.then(async (res) => {
				setUploadURLs(res.uploadURLs)
				setReportId(res.id)
			})
			.catch(console.error)
			.finally(() => setSubmitting(false))
	}, [trashType, location, description, photos, user])

	useEffect(() => {
		if (submitting) return
		if (photos.length === 0 || uploaded.length === photos.length) {
			console.log(`/report/${reportId}`)
			route(`/report/${reportId}`)
			return
		}
	}, [uploaded, uploadURLs, submitting])

	return (
		<>
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6 mb-4">
					{submitting && (
						<>
							<div
								class="progress"
								role="progressbar"
								aria-label="Animated striped example"
								aria-valuenow={50}
								aria-valuemin={0}
								aria-valuemax={100}
							>
								<div
									class="progress-bar progress-bar-striped progress-bar-animated"
									style="width: 50%"
								></div>
							</div>
							<p>Submitting...</p>
						</>
					)}
					{(uploadURLs ?? []).map((url, i) => (
						<UploadPhoto
							url={url}
							photo={photos[i]!}
							onComplete={() => {
								setUploaded((prev) => [...prev, url])
							}}
						/>
					))}
				</div>
			</div>
		</>
	)
}

const UploadPhoto = ({
	url,
	photo,
	onComplete,
}: {
	url: string
	photo: Blob
	onComplete: () => void
}) => {
	const [status, setStatus] = useState<'idle' | 'uploading' | 'done'>('idle')

	useEffect(() => {
		if (status === 'idle') {
			setStatus('uploading')

			fetch(url, {
				method: 'PUT',
				body: photo,
			})
				.then(() => {
					setStatus('done')
					onComplete()
				})
				.catch(() => setStatus('idle'))
		}
	}, [status, url, photo])

	return (
		<div>
			<p>
				{status === 'uploading'
					? 'Uploading photo...'
					: status === 'done'
						? 'Photo upload complete!'
						: 'Failed to upload.'}
			</p>
		</div>
	)
}
