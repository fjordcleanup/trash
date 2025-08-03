import type { Report } from '#context/Reports.tsx'

export const TrashCardBodyDescription = ({ report }: { report: Report }) => {
	if (report.description === undefined) return null
	return (
		<p>
			<small class="text-muted">Description</small>
			<br />
			{report.description}
		</p>
	)
}
