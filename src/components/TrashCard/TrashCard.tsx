import { Ago } from '#components/Ago.tsx'
import { LocationLinks } from '#components/LocationLinks.tsx'
import { useAuth } from '#context/Auth.tsx'
import type { Report } from '#context/Reports.tsx'
import cx from 'classnames'
import { CheckCheck, Trash } from 'lucide-preact'
import { route } from 'preact-router'
import { useMemo } from 'preact/hooks'
import { decodeTime } from 'ulidx'
import { PhotoSize } from '../../../domain/PhotoSize.ts'
import { MiniMap } from '../MiniMap.tsx'
import { TrashTypeSymbol } from '../TrashTypeSymbol.tsx'
import { Photo } from './Photo.tsx'

import './TrashCard.css'

export const TrashCard = ({ report }: { report: Report }) => {
	const { isAdmin, user } = useAuth()
	const photos = useMemo(
		() =>
			Object.values(report.photos)
				.filter((sizes) => sizes !== null)
				.slice(0, 1),
		[report],
	)
	return (
		<div class="card trash-card">
			<div
				class={cx('card-header', {
					'no-photos': photos.length === 0, // In case the photos are not processed yet
					'one-photo': photos.length === 1,
					'two-photos': photos.length === 2,
				})}
				style={{ padding: '0' }}
			>
				<MiniMap markerLocation={report.location} />
				{/* TODO: use lazy loading for images */}
				{photos.map((sizes, index) => (
					<Photo key={index} url={new URL(sizes[PhotoSize.thumbnail])} />
				))}
				<TrashTypeSymbol types={report.type} />
			</div>
			<div class="id">{report.$meta.id.slice(-6)}</div>
			<div class="card-body">
				{report.description !== undefined && (
					<p>
						<small class="text-muted">Description</small>
						<br />
						{report.description}
					</p>
				)}
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
