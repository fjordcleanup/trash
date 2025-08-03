import { useReports } from '#context/Reports.tsx'
import { route } from 'preact-router'
import { useEffect } from 'preact/hooks'

export const ShareLink = (props: { shortReportId: string }) => {
	const { reports } = useReports()

	useEffect(() => {
		if (reports.length === 0) return
		const report = reports.find((r) => r.$meta.id.endsWith(props.shortReportId))
		if (report !== undefined) {
			route(`/map/${report.$meta.id}`)
		} else {
			route('/')
		}
	}, [reports, props.shortReportId])

	return <p>Loading ...</p>
}
