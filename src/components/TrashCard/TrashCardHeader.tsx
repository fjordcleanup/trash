import { MiniMap } from '#components/MiniMap.tsx'
import { TrashTypeSymbol } from '#components/TrashTypeSymbol.tsx'
import type { Report } from '#context/Reports.tsx'
import { PhotoSize } from '#domain/PhotoSize.ts'
import { shortId } from '#domain/shortId.ts'
import cx from 'classnames'
import { useMemo } from 'preact/hooks'
import { Photo } from './Photo.tsx'

export const TrashCardHeader = ({ report }: { report: Report }) => {
	const photos = useMemo(
		() =>
			Object.values(report.photos)
				.filter((sizes) => sizes !== null)
				.slice(0, 1),
		[report],
	)
	return (
		<>
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
			<div class="id">{shortId(report)}</div>
		</>
	)
}
