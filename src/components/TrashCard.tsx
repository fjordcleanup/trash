import cx from 'classnames'
import type { LngLat } from 'maplibre-gl'
import { useRef, useState } from 'preact/hooks'
import type { TrashType } from '../../api/TrashType.ts'
import { MiniMap } from './MiniMap.tsx'
import { TrashTypeSymbol } from './TrashTypeSymbol.tsx'

import './TrashCard.css'

export const TrashCard = ({
	trashType,
	location,
	description,
	photos,
}: {
	trashType: Array<TrashType>
	location: LngLat
	description?: string
	photos: Array<URL>
}) => (
	<div class="card trash-card">
		<div class="card-header" style={{ padding: '0' }}>
			<MiniMap markerLocation={location} />
			<TrashTypeSymbol types={trashType} />
			{photos.map((url, index) => (
				<Photo key={index} url={url} />
			))}
		</div>
		{description !== undefined && (
			<div class="card-body">
				<p>
					<small class="text-muted">Description</small>
					<br />
					{description}
				</p>
			</div>
		)}
	</div>
)

const Photo = ({ url }: { url: URL }) => {
	const ref = useRef<HTMLImageElement>(null)
	const [aspectRatio, setAspectRatio] = useState<number>(1)
	return (
		<div class="photo-container">
			<img
				ref={ref}
				src={url.toString()}
				alt="Trash photo"
				onLoad={() => {
					if (ref.current) {
						setAspectRatio(ref.current.naturalWidth / ref.current.naturalHeight)
					}
				}}
				class={cx({ portrait: aspectRatio < 1, landscape: aspectRatio >= 1 })}
			/>
		</div>
	)
}
