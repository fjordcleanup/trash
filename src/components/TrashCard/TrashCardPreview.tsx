import type { TrashType } from '../../../domain/TrashType.ts'
import { MiniMap } from '../MiniMap.tsx'
import { TrashTypeSymbol } from '../TrashTypeSymbol.tsx'
import { Photo } from './Photo.tsx'

import './TrashCard.css'

export const TrashCardPreview = ({
	trashType,
	location,
	description,
	photos,
}: {
	trashType: Array<TrashType>
	location: { lng: number; lat: number }
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
