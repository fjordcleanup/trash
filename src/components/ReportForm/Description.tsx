import { EScooter } from '#icons/Escooter.tsx'
import { Tire } from '#icons/Tire.tsx'
import { Trash } from '#icons/Trash.tsx'
import cx from 'classnames'
import { Frown } from 'lucide-preact'

import './Description.css'

export const Description = ({
	onEscooterClick = () => {},
	onBulkClick = () => {},
	onLitterClick = () => {},
	onOtherClick = () => {},
	onDescriptionChange = () => {},
	description = '',
	EscooterSelected = false,
	BulkSelected = false,
	LitterSelected = false,
	OtherSelected = false,
}: {
	onEscooterClick?: () => void
	onBulkClick?: () => void
	onLitterClick?: () => void
	onOtherClick?: () => void
	onDescriptionChange?: (value: string) => void
	description: string
	EscooterSelected: boolean
	BulkSelected: boolean
	LitterSelected: boolean
	OtherSelected: boolean
}) => (
	<div class="row justify-content-center">
		<div class="col-12 col-md-8 col-lg-6">
			<h2 class="text-dark fs-4 mb-3">Type of trash</h2>
			<p>
				This is important to help us organize the cleanup efforts. Please select
				the type of trash you are reporting. If you are unsure, you can select
				"Other" and provide a description.
			</p>
			<div class="trash-type-selection">
				<div class="d-flex align-items-center">
					<button
						type="button"
						class={cx('btn btn-outline-secondary me-4 escooter', {
							active: EscooterSelected,
						})}
						onClick={onEscooterClick}
					>
						<div class="trash-type trash-type-escooter flex-shrink-0">
							<EScooter class="icon" />
						</div>
					</button>
					<p>
						<strong>E-Scooter</strong>
						<br />
						Select this if the trash contains one or more e-scooters.
						<br />
						<small class="text-muted">
							We can remove them from the water and place them at the side of
							the road, so the scooter company can pick them up.
						</small>
					</p>
				</div>
				<div class="d-flex align-items-center">
					<button
						type="button"
						class={cx('btn btn-outline-secondary me-4 bulk', {
							active: BulkSelected,
						})}
						onClick={onBulkClick}
					>
						<div class="trash-type trash-type-bulk flex-shrink-0">
							<Tire class="icon" />
						</div>
					</button>
					<p>
						<strong>Bulk trash</strong>
						<br />
						Select this if the trash contains bulk items like tires or
						furniture.
						<br />
						<small class="text-muted">
							We need to arrange for a big-pack from our sponsor{' '}
							<a href="https://www.isekk.no/" target="_blank">
								iSEKK
							</a>{' '}
							to be available for pickup.
						</small>
					</p>
				</div>
				<div class="d-flex align-items-center">
					<button
						type="button"
						class={cx('btn btn-outline-secondary me-4 litter', {
							active: LitterSelected,
						})}
						onClick={onLitterClick}
					>
						<div class="trash-type trash-type-litter flex-shrink-0">
							<Trash class="icon" />
						</div>
					</button>
					<p>
						<strong>Litter</strong>
						<br />
						Select this if the trash contains small items like cans, bottles,
						etc.
						<br />
						<small class="text-muted">
							We can collect this and throw it into regular trash containers
							nearby.
						</small>
					</p>
				</div>
				<div class="d-flex align-items-center">
					<button
						type="button"
						class={cx('btn btn-outline-secondary me-4 other', {
							active: OtherSelected,
						})}
						onClick={onOtherClick}
					>
						<div class="trash-type trash-type-other flex-shrink-0">
							<Frown class="icon" strokeWidth={1} />
						</div>
					</button>
					<p>
						<strong>Other</strong>
						<br />
						Select this if the trash does not fit into any of the other
						categories.
						<br />
						<small class="text-muted">
							Please provide a description of the trash you are reporting.
						</small>
					</p>
				</div>
			</div>
			<div class="mt-4">
				<label for="description" class="form-label">
					Additional information
				</label>
				<textarea
					class="form-control"
					id="description"
					rows={3}
					aria-describedby="helpBlock"
					onBlur={(e) => onDescriptionChange((e.target as any).value)}
					value={description}
				></textarea>
				<div id="helpBlock" class="form-text">
					Please provide any additional information that might help us with the
					cleanup, such as the exact location of the trash or any other relevant
					details.
				</div>
			</div>
		</div>
	</div>
)
