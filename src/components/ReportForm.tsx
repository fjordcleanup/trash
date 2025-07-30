import type { LngLat } from 'maplibre-gl'
import { useMemo, useState } from 'preact/hooks'
import { TrashType } from '../api/TrashType.ts'
import { Description } from './ReportForm/Description.tsx'
import { PhotoGallery } from './ReportForm/PhotoGallery.tsx'
import { PhotoHelp } from './ReportForm/PhotoHelp.tsx'
import { PhotoUpload } from './ReportForm/PhotoUpload.tsx'
import { Preview } from './ReportForm/Preview.tsx'
import { SelectLocation } from './ReportForm/SelectLocation.tsx'
import { Start } from './ReportForm/Start.tsx'
import { Submit } from './ReportForm/Submit.tsx'
import { ThankYou } from './ReportForm/ThankYou.tsx'

enum Steps {
	Start = 'start',
	SelectLocation = 'select-location',
	Preview = 'preview',
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
	Steps.Preview,
	Steps.Submit,
	Steps.ThankYou,
]

const photoLimit = 2

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
			[Steps.Preview]:
				photos.length > 0 && trashType.length > 0 && location !== undefined,
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
					{photos.length < photoLimit && (
						<PhotoUpload
							onImage={(image) => {
								setPhotos((prev) => [...prev, image])
							}}
						/>
					)}
					<PhotoGallery
						photos={photos}
						removePhoto={(index) => {
							setPhotos((prev) => prev.filter((_, i) => i !== index))
						}}
					/>
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
			{step === Steps.Preview && (
				<Preview
					trashType={trashType}
					location={location!}
					description={description}
					photos={photos}
				/>
			)}
			{step === Steps.Submit && (
				<Submit
					trashType={trashType}
					location={location!}
					description={description}
					photos={photos}
				/>
			)}
			{step === Steps.ThankYou && <ThankYou />}
			<div class="row justify-content-center mt-4">
				<div class="col-12 col-md-8 col-lg-6">
					<p class="d-flex justify-content-between align-items-center">
						<button
							type="button"
							class="btn btn-secondary"
							disabled={!prevEnabled}
							onClick={() => prev()}
						>
							Previous
						</button>
						{step !== Steps.Preview && (
							<button
								type="button"
								class="btn btn-primary"
								disabled={!nextEnabled}
								onClick={() => next()}
							>
								Next
							</button>
						)}
						{step === Steps.Preview && (
							<button
								type="button"
								class="btn btn-primary"
								onClick={() => setStep(Steps.Submit)}
							>
								Report
							</button>
						)}
					</p>
				</div>
			</div>
		</main>
	)
}
