import { Ago } from '#components/Ago.tsx'
import { LocationLinks } from '#components/LocationLinks.tsx'
import { useAuth } from '#context/Auth.tsx'
import type { Report } from '#context/Reports.tsx'
import { CheckCheck, Trash } from 'lucide-preact'
import { route } from 'preact-router'
import { decodeTime } from 'ulidx'

import './TrashCard.css'
import { TrashCardBodyDescription } from './TrashCardBodyDescription.tsx'
import { TrashCardHeader } from './TrashCardHeader.tsx'

export const TrashCard = ({ report }: { report: Report }) => {
	const { isAdmin, user } = useAuth()
	return (
		<div class="card trash-card">
			<TrashCardHeader report={report} />
			<div class="card-body">
				<TrashCardBodyDescription report={report} />
				<p>
					<small class="text-muted">View location on</small>
					<br />
					<LocationLinks location={report.location} />
				</p>
				<p>
					<small class="text-muted">Reported</small>
					<br />
					<Ago date={new Date(decodeTime(report.$meta.id))} /> ago
				</p>
				<p>
					<small class="text-muted">Share</small>
					<br />
					<a href={`/share/${report.$meta.id}/ig`}>Instagram</a>
				</p>
			</div>
			<div class="card-footer d-flex justify-content-between">
				<div>
					{report.isPublic === true && (
						<button
							class="btn btn-success me-2"
							onClick={() => {
								window.alert('This feature is not implemented yet!')
							}}
						>
							It's cleaned!
						</button>
					)}
					{isAdmin && (
						<button
							class="btn btn-outline-danger me-2"
							title={'Delete this report'}
							onClick={() => {
								if (
									window.confirm('Are you sure you want to delete this report?')
								) {
									fetch(
										new URL(
											`https://api.fjordcleanup.org/sudo/report/${report.$meta.id}`,
										),
										{
											method: 'DELETE',
											headers: {
												Authorization: `Bearer ${user?.id_token}`,
												'If-Match': report.$meta.version.toString(),
											},
										},
									)
										.then(async (res) => {
											if (res.ok) {
												route('/map')
											} else {
												throw new Error(
													`Failed to delete report: ${await res.json()}`,
												)
											}
										})
										.catch(console.error)
								}
							}}
						>
							<Trash />
						</button>
					)}
					{isAdmin && report.isPublic !== true && (
						<button
							class="btn btn-outline-info"
							title={'Publish this report to the map'}
							onClick={() => {
								if (
									window.confirm(
										'Are you sure you want to publish this report?',
									)
								) {
									fetch(
										new URL(
											`https://api.fjordcleanup.org/sudo/report/${report.$meta.id}/publish`,
										),
										{
											method: 'PUT',
											headers: {
												Authorization: `Bearer ${user?.id_token}`,
												'If-Match': report.$meta.version.toString(),
											},
										},
									)
										.then(async (res) => {
											if (res.ok) {
												route('/map')
											} else {
												throw new Error(
													`Failed to publish report: ${await res.json()}`,
												)
											}
										})
										.catch(console.error)
								}
							}}
						>
							<CheckCheck />
						</button>
					)}
				</div>
				<button
					class="btn btn-outline-secondary"
					onClick={() => {
						route('/map')
					}}
				>
					close
				</button>
			</div>
		</div>
	)
}
