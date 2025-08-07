import type { PhotoSize } from '#domain/PhotoSize.ts'
import type { TrashType } from '#domain/TrashType.ts'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import type { AggregateMeta } from '../../aggregate/AggregateMeta.ts'
import { useAuth } from './Auth.tsx'

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
	isPublic?: boolean
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
	const { user, isAdmin } = useAuth()

	useEffect(() => {
		const t = setTimeout(() => {
			fetch(
				isAdmin
					? new URL('https://api.fjordcleanup.org/sudo/reports')
					: new URL('https://api.fjordcleanup.org/reports'),
				{
					method: 'GET',
					headers:
						user?.id_token === undefined
							? {}
							: {
									Authorization: `Bearer ${user.id_token}`,
								},
				},
			)
				.then(async (res) => res.json())
				.then(async (res) => {
					setReports(res.items)
				})
				.catch(console.error)
		}, 500)
		return () => {
			clearTimeout(t)
		}
	}, [user, isAdmin])

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
