import type { LngLat } from 'maplibre-gl'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useMemo, useState } from 'preact/hooks'
import type { TrashType } from '../../domain/TrashType.ts'
import { useAuth } from './Auth.tsx'
import { useReports } from './Reports.tsx'

const PHOTO_LIMIT = 2

export const ReportContext = createContext<{
	photoLimit: number
	location?: LngLat
	setLocation: (args: LngLat) => void
	photos: Blob[]
	setPhotos: (args: Blob[]) => void
	addPhoto: (photo: Blob) => void
	removePhoto: (index: number) => void
	description?: string
	setDescription: (args: string) => void
	trashType: Array<TrashType>
	setTrashType: (args: Array<TrashType>) => void
	isValid: boolean
	reportId?: string
	report: () => void
	submitting: boolean
	clear: () => void
}>({
	photoLimit: PHOTO_LIMIT,
	setLocation: () => undefined,
	photos: [],
	setPhotos: () => undefined,
	addPhoto: () => undefined,
	removePhoto: () => undefined,
	setDescription: () => undefined,
	trashType: [],
	setTrashType: () => undefined,
	isValid: false,
	report: () => undefined,
	submitting: false,
	clear: () => undefined,
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const { user } = useAuth()
	const { addReport } = useReports()
	const [location, setLocation] = useState<LngLat>()
	const [photos, setPhotos] = useState<Blob[]>([])
	const [description, setDescription] = useState<string | undefined>(undefined)
	const [trashType, setTrashType] = useState<Array<TrashType>>([])
	const [reportId, setReportId] = useState<string>()
	const [submitting, setSubmitting] = useState(false)

	const isValid = useMemo(
		() =>
			location !== undefined &&
			photos.length > 0 &&
			trashType.length > 0 &&
			(description === undefined || description.trim().length > 0),
		[location, photos, trashType, description],
	)

	return (
		<ReportContext.Provider
			value={{
				location,
				setLocation,
				photos,
				setPhotos,
				addPhoto: (photo: Blob) => setPhotos((prev) => [...prev, photo]),
				removePhoto: (index: number) =>
					setPhotos((prev) => prev.filter((_, i) => i !== index)),
				description,
				setDescription: (description: string) => {
					if (description.trim().length > 0) {
						setDescription(description)
					} else {
						setDescription(undefined)
					}
				},
				trashType,
				setTrashType,
				photoLimit: PHOTO_LIMIT,
				isValid,
				reportId,
				report: () => {
					if (!isValid) return
					if (user?.id_token === undefined) return
					setSubmitting(true)
					fetch(new URL('https://api.fjordcleanup.org/2025-08-01/report'), {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${user.id_token}`,
						},
						body: JSON.stringify({
							type: trashType,
							location,
							description,
							numPhotos: photos.length,
						}),
					})
						.then(async (res) => res.json())
						.then(async (res) => {
							setReportId(res.$meta.id)
							addReport(res)
							return Promise.all(
								res.uploadURLs.map(async (url: string, i: number) =>
									fetch(url, {
										method: 'PUT',
										body: photos[i]!,
									}),
								),
							)
						})
						.catch(console.error)
						.finally(() => setSubmitting(false))
				},
				submitting,
				clear: () => {
					setLocation(undefined)
					setPhotos([])
					setDescription(undefined)
					setTrashType([])
					setReportId(undefined)
				},
			}}
		>
			{children}
		</ReportContext.Provider>
	)
}

export const Consumer = ReportContext.Consumer

export const useReport = () => useContext(ReportContext)
