import { TrashCardBodyDescription } from '#components/TrashCard/TrashCardBodyDescription.tsx'
import { TrashCardHeader } from '#components/TrashCard/TrashCardHeader.tsx'
import { useReports } from '#context/Reports.tsx'
import { useMemo } from 'preact/hooks'

import { shortId } from '#domain/shortId.ts'
import './InstagramShare.css'

export const InstagramShare = (props: { reportId: string }) => {
	const { reports } = useReports()
	const report = useMemo(
		() => reports.find((r) => r.$meta.id === props.reportId),
		[reports, props.reportId],
	)
	return (
		<main class="ig-share">
			<div class="d-flex flex-row align-items-center justify-content-center text-white pt-4">
				<img src="/static/logo.webp" alt="Fjord CleanUP" class="logo me-4" />
				<h1>
					Fjord CleanUP
					<br />
					<small>Trash Report</small>
				</h1>
			</div>
			{report !== undefined && (
				<div class="d-flex flex-column align-items-center">
					<div class="card trash-card mt-4">
						<TrashCardHeader report={report} />
						<div class="card-body">
							<TrashCardBodyDescription report={report} />
							<p>
								<small class="text-muted">Details</small>
								<br />
								<strong>
									{document.location.host}/map/{shortId(report)}
								</strong>
							</p>
						</div>
					</div>
				</div>
			)}
			<div class="p-4 text-white opacity-75">
				<p>
					Trash reports are created by volunteers who care about the
					environment.
				</p>
				<p>
					Go to trash.fjordcleanup.org to discover more and report trash
					yourself.
				</p>
				<p>Together, we can make the Oslo fjord and Akerselva cleaner.</p>
			</div>
		</main>
	)
}
