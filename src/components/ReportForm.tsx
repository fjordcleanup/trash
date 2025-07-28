import type { LngLat } from 'maplibre-gl'
import { useMemo, useState } from 'preact/hooks'
import { Description } from './ReportForm/Description.tsx'
import { PhotoGallery } from './ReportForm/PhotoGallery.tsx'
import { PhotoHelp } from './ReportForm/PhotoHelp.tsx'
import { PhotoUpload } from './ReportForm/PhotoUpload.tsx'
import { SelectLocation } from './ReportForm/ReportForm.tsx'
import { Start } from './ReportForm/Start.tsx'
import { ThankYou } from './ReportForm/ThankYou.tsx'
import { TrashTypeDiamond } from './ReportForm/TrashTypeDiamond.tsx'

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

const photoLimit = 2

export enum TrashType {
	Escooter = 'escooter',
	Bulk = 'bulk',
	Litter = 'litter',
	Other = 'other',
}

export const ReportForm = () => {
	const [step, setStep] = useState<Steps>(Steps.Start)
	const [location, setLocation] = useState<LngLat>()
	const [photos, setPhotos] = useState<Blob[]>([])
	const [description, setDescription] = useState<string>('')
	const [trashType, setTrashType] = useState<Array<TrashType>>([])

	const steps: Record<Steps, boolean> = useMemo(() => {
		const states = {
			[Steps.Start]: true,
			[Steps.SelectLocation]: location !== undefined,
			[Steps.PhotoUpload]: photos.length > 0,
			[Steps.Description]: trashType.length > 0,
			[Steps.Submit]: false,
			[Steps.ThankYou]: false,
		}
		return states
	}, [location, photos, trashType])

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

	const EscooterSelected = useMemo(
		() => trashType.includes(TrashType.Escooter),
		[trashType],
	)
	const BulkSelected = useMemo(
		() => trashType.includes(TrashType.Bulk),
		[trashType],
	)
	const LitterSelected = useMemo(
		() => trashType.includes(TrashType.Litter),
		[trashType],
	)
	const OtherSelected = useMemo(
		() => trashType.includes(TrashType.Other),
		[trashType],
	)

	return (
		<main class="container mt-4">
			{step === Steps.Start && <Start />}
			{step === Steps.SelectLocation && (
				<SelectLocation
					selectedLocation={location}
					onLocation={(lngLat) => setLocation(lngLat)}
				/>
			)}
			{step === Steps.PhotoUpload && (
				<>
					<PhotoHelp limit={photoLimit} />
					<PhotoGallery
						photos={photos}
						removePhoto={(index) => {
							setPhotos((prev) => prev.filter((_, i) => i !== index))
						}}
					/>
					{photos.length < photoLimit && (
						<PhotoUpload
							onImage={(image) => {
								setPhotos((prev) => [...prev, image])
							}}
						/>
					)}
				</>
			)}
			{step === Steps.Description && (
				<>
					<Description
						onDescriptionChange={setDescription}
						description={description}
						EscooterSelected={EscooterSelected}
						BulkSelected={BulkSelected}
						LitterSelected={LitterSelected}
						OtherSelected={OtherSelected}
						onBulkClick={() => {
							if (!BulkSelected) {
								setTrashType([...trashType, TrashType.Bulk])
							} else {
								setTrashType(
									trashType.filter((type) => type !== TrashType.Bulk),
								)
							}
						}}
						onEscooterClick={() => {
							if (!EscooterSelected) {
								setTrashType([...trashType, TrashType.Escooter])
							} else {
								setTrashType(
									trashType.filter((type) => type !== TrashType.Escooter),
								)
							}
						}}
						onLitterClick={() => {
							if (!LitterSelected) {
								setTrashType([...trashType, TrashType.Litter])
							} else {
								setTrashType(
									trashType.filter((type) => type !== TrashType.Litter),
								)
							}
						}}
						onOtherClick={() => {
							if (!OtherSelected) {
								setTrashType([...trashType, TrashType.Other])
							} else {
								setTrashType(
									trashType.filter((type) => type !== TrashType.Other),
								)
							}
						}}
					/>
				</>
			)}
			{step === Steps.Submit && (
				<>
					<div class="row justify-content-center">
						<div class="col-3 col-md-2">
							<TrashTypeDiamond types={trashType} />
						</div>
					</div>
					<div class="row justify-content-center mt-4">
						<div class="col-12 col-md-8 col-lg-6">
							<p>
								<strong>Location:</strong> {location?.toString()}
							</p>
							<p>
								<strong>Description:</strong> {description}
							</p>
							<p>
								<strong>Photos:</strong> {photos.length} uploaded
							</p>
						</div>
					</div>
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
