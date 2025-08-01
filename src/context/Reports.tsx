import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'
import type { PhotoSize } from '../../domain/PhotoSize.ts'
import type { TrashType } from '../../domain/TrashType.ts'
import type { AggregateMeta } from '../../persistence/aggregate/AggregateMeta.ts'

export type Report = {
	$meta: AggregateMeta
	location: {
		lng: number
		lat: number
	}
	type: Array<TrashType>
	photos: Record<
		string,
		null | {
			[PhotoSize.scaled]: string
			[PhotoSize.thumbnail]: string
			[PhotoSize.placeholder]: string
		}
	>
	description?: string
	status?: 'approved'
}

export const ReportsContext = createContext<{
	reports: Array<Report>
	addReport: (report: Report) => void
}>({
	reports: [],
	addReport: () => {},
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [reports, setReports] = useState<Array<Report>>([])

	const fetchReports = useMemo(
		() => async () => {
			fetch(new URL('https://api.fjordcleanup.org/2025-08-01/reports'), {
				method: 'GET',
			})
				.then(async (res) => res.json())
				.then(async (res) => {
					setReports(res.items)
				})
				.catch(console.error)
		},
		[],
	)

	useEffect(() => {
		fetchReports().catch(console.error)
	}, [])

	return (
		<ReportsContext.Provider
			value={{
				reports,
				addReport: (report: Report) => {
					setReports((prevReports) => [...prevReports, report])
				},
			}}
		>
			{children}
		</ReportsContext.Provider>
	)
}

export const Consumer = ReportsContext.Consumer

export const useReports = () => useContext(ReportsContext)
