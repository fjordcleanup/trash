import { Ago } from '#components/Ago.tsx'
import { LocationLinks } from '#components/LocationLinks.tsx'
import type { Report } from '#context/Reports.tsx'
import cx from 'classnames'
import { route } from 'preact-router'
import { useMemo } from 'preact/hooks'
import { decodeTime } from 'ulidx'
import { PhotoSize } from '../../../domain/PhotoSize.ts'
import { MiniMap } from '../MiniMap.tsx'
import { TrashTypeSymbol } from '../TrashTypeSymbol.tsx'
import { Photo } from './Photo.tsx'

import './TrashCard.css'

export const TrashCard = ({ report }: { report: Report }) => {
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
				<button
					class="btn btn-success"
					onClick={() => {
						window.alert('This feature is not implemented yet!')
					}}
				>
					It's cleaned!
				</button>
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
