import type { Report } from '#context/Reports.tsx'

export const TrashCardBodyDescription = ({ report }: { report: Report }) => {
	if (report.description === undefined) return null
	return (
		<div class="description mb-2">
			<small class="text-muted">Description</small>
			<br />
			<div class="description-body mb-2">
				<p>{report.description}</p>
			</div>
		</div>
	)
}
