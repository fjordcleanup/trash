import type { LngLat } from 'maplibre-gl'
import { useMemo, useState } from 'preact/hooks'
import { PhotoGallery } from './ReportForm/PhotoGallery.tsx'
import { PhotoHelp } from './ReportForm/PhotoHelp.tsx'
import { PhotoUpload } from './ReportForm/PhotoUpload.tsx'
import { SelectLocation } from './ReportForm/ReportForm.tsx'
import { Start } from './ReportForm/Start.tsx'
import { ThankYou } from './ReportForm/ThankYou.tsx'

enum Steps {
	Start = 'start',
	SelectLocation = 'select-location',
	Submit = 'submit',
	PhotoUpload = 'photo-upload',
	Description = 'description',
	ThankYou = 'thank-you',
}

const stepOrder = [
	Steps.Start,
	Steps.SelectLocation,
	Steps.PhotoUpload,
	Steps.Description,
	Steps.Submit,
	Steps.ThankYou,
]

export const ReportForm = () => {
	const [step, setStep] = useState<Steps>(Steps.Start)
	const [location, setLocation] = useState<LngLat>()
	const [photos, setPhotos] = useState<Blob[]>([])

	const steps: Record<Steps, boolean> = useMemo(() => {
		const states = {
			[Steps.Start]: true,
			[Steps.SelectLocation]: location !== undefined,
			[Steps.PhotoUpload]: photos.length > 0,
			[Steps.Description]: false,
			[Steps.Submit]: false,
			[Steps.ThankYou]: false,
		}
		return states
	}, [location, photos])

	const nextEnabled = useMemo(() => steps[step] ?? false, [steps, step])
	const prevEnabled = useMemo(() => stepOrder.indexOf(step) > 0, [steps, step])

	const next = () => {
		if (!nextEnabled) return
		const nextStep = stepOrder[stepOrder.indexOf(step) + 1]
		if (nextStep !== undefined) {
			setStep(nextStep)
		}
	}

	const prev = () => {
		if (!prevEnabled) return
		const prevStep = stepOrder[stepOrder.indexOf(step) - 1]
		if (prevStep !== undefined) {
			setStep(prevStep)
		}
	}

	return (
		<main class="container mt-4">
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6">
					<h1 class="text-dark fs-1 mb-3">Report trash to Fjord CleanUP</h1>
				</div>
			</div>
			{step === Steps.Start && <Start />}
			{step === Steps.SelectLocation && (
				<SelectLocation
					selectedLocation={location}
					onLocation={(lngLat) => setLocation(lngLat)}
				/>
			)}
			{step === Steps.PhotoUpload && (
				<>
					<PhotoHelp />

					<PhotoGallery
						photos={photos}
						removePhoto={(index) => {
							setPhotos((prev) => prev.filter((_, i) => i !== index))
						}}
					/>
					{photos.length < 2 && (
						<PhotoUpload
							onImage={(image) => {
								setPhotos((prev) => [...prev, image])
							}}
						/>
					)}
				</>
			)}
			{step === Steps.ThankYou && <ThankYou />}
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6">
					<hr />
					<p class="d-flex justify-content-between align-items-center">
						<button
							type="button"
							class="btn btn-secondary"
							disabled={!prevEnabled}
							onClick={() => prev()}
						>
							Previous
						</button>
						<button
							type="button"
							class="btn btn-primary"
							disabled={!nextEnabled}
							onClick={() => next()}
						>
							Next
						</button>
					</p>
				</div>
			</div>
		</main>
	)
}
