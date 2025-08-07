import { TrashType } from '#domain/TrashType.ts'
import { EScooter } from '#icons/Escooter.tsx'
import { Tire } from '#icons/Tire.tsx'
import { Trash } from '#icons/Trash.tsx'
import cx from 'classnames'
import { Frown } from 'lucide-preact'

import './TrashTypeSymbol.css'

export const TrashTypeSymbol = ({ types }: { types: Array<TrashType> }) => {
	return (
		<div className="trash-type-symbol">
			<div
				class={cx('escooter', { selected: types.includes(TrashType.Escooter) })}
			>
				<EScooter class="icon" />
			</div>
			<div class={cx('bulk', { selected: types.includes(TrashType.Bulk) })}>
				<Tire class="icon" />
			</div>
			<div class={cx('litter', { selected: types.includes(TrashType.Litter) })}>
				<Trash class="icon" />
			</div>
			<div class={cx('other', { selected: types.includes(TrashType.Other) })}>
				<Frown class="icon" strokeWidth={1} />
			</div>
		</div>
	)
}
