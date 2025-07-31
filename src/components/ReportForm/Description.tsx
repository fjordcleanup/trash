import { EScooter } from '#icons/Escooter.tsx'
import { Tire } from '#icons/Tire.tsx'
import { Trash } from '#icons/Trash.tsx'
import cx from 'classnames'
import { Frown, MessageSquareQuote } from 'lucide-preact'

import { useReport } from '#context/Report.tsx'
import { route } from 'preact-router'
import { useMemo } from 'preact/hooks'
import { TrashType } from '../../../api/TrashType.ts'
import './Description.css'

export const Description = () => {
	const { trashType, setTrashType, description, setDescription } = useReport()

	const EscooterSelected = useMemo(
		() => trashType.includes(TrashType.Escooter),
		[trashType],
	)
	const BulkSelected = useMemo(
		() => trashType.includes(TrashType.Bulk),
		[trashType],
	)
	const LitterSelected = useMemo(
		() => trashType.includes(TrashType.Litter),
		[trashType],
	)
	const OtherSelected = useMemo(
		() => trashType.includes(TrashType.Other),
		[trashType],
	)

	const onLitterClick = useMemo(
		() => () => {
			if (!LitterSelected) {
				setTrashType([...trashType, TrashType.Litter])
			} else {
				setTrashType(trashType.filter((type) => type !== TrashType.Litter))
			}
		},
		[LitterSelected, setTrashType, trashType],
	)

	const onEscooterClick = useMemo(
		() => () => {
			if (!EscooterSelected) {
				setTrashType([...trashType, TrashType.Escooter])
			} else {
				setTrashType(trashType.filter((type) => type !== TrashType.Escooter))
			}
		},
		[EscooterSelected, setTrashType, trashType],
	)

	const onBulkClick = useMemo(
		() => () => {
			if (!BulkSelected) {
				setTrashType([...trashType, TrashType.Bulk])
			} else {
				setTrashType(trashType.filter((type) => type !== TrashType.Bulk))
			}
		},
		[BulkSelected, setTrashType, trashType],
	)

	const onOtherClick = useMemo(
		() => () => {
			if (!OtherSelected) {
				setTrashType([...trashType, TrashType.Other])
			} else {
				setTrashType(trashType.filter((type) => type !== TrashType.Other))
			}
		},
		[OtherSelected, setTrashType, trashType],
	)

	return (
		<>
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6">
					<h2 class="fs-2 mb-3 d-flex align-items-center">
						<MessageSquareQuote class="flex-shrink-0 me-2" size={24} />
						<span>Tell us more</span>
					</h2>
					<p>
						This is important to help us organize the cleanup efforts. Please
						select the type of trash you are reporting. If you are unsure, you
						can select "Other" and provide a description.
					</p>
					<div class="trash-type-selection">
						<div class="d-flex align-items-start">
							<button
								type="button"
								class={cx('btn btn-outline-secondary me-3 escooter', {
									active: EscooterSelected,
								})}
								onClick={onEscooterClick}
							>
								<div class="trash-type trash-type-escooter flex-shrink-0">
									<EScooter class="icon" />
								</div>
							</button>
							<div>
								<div class="form-check">
									<input
										class="form-check-input"
										type="checkbox"
										value=""
										id="escooterCheck"
										checked={EscooterSelected}
										onChange={onEscooterClick}
									/>
									<label class="form-check-label" for="escooterCheck">
										<strong>E-Scooter</strong>
									</label>
								</div>
								<p>
									Select this if the trash contains one or more e-scooters.
									<br />
									<small class="text-muted">
										We can remove them from the water and place them at the side
										of the road, so the scooter company can pick them up.
									</small>
								</p>
							</div>
						</div>
						<div class="d-flex align-items-start">
							<button
								type="button"
								class={cx('btn btn-outline-secondary me-3 bulk', {
									active: BulkSelected,
								})}
								onClick={onBulkClick}
							>
								<div class="trash-type trash-type-bulk flex-shrink-0">
									<Tire class="icon" />
								</div>
							</button>
							<div>
								<div class="form-check">
									<input
										class="form-check-input"
										type="checkbox"
										value=""
										id="bulkCheck"
										checked={BulkSelected}
										onChange={onBulkClick}
									/>
									<label class="form-check-label" for="bulkCheck">
										<strong>Bulk trash</strong>
									</label>
								</div>
								<p>
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
						</div>
						<div class="d-flex align-items-start">
							<button
								type="button"
								class={cx('btn btn-outline-secondary me-3 litter', {
									active: LitterSelected,
								})}
								onClick={onLitterClick}
							>
								<div class="trash-type trash-type-litter flex-shrink-0">
									<Trash class="icon" />
								</div>
							</button>
							<div>
								<div class="form-check">
									<input
										class="form-check-input"
										type="checkbox"
										value=""
										id="litterCheck"
										checked={LitterSelected}
										onChange={onLitterClick}
									/>
									<label class="form-check-label" for="litterCheck">
										<strong>Litter</strong>
									</label>
								</div>
								<p>
									Select this if the trash contains small items like cans,
									bottles, etc.
									<br />
									<small class="text-muted">
										We can collect this and throw it into regular trash
										containers nearby.
									</small>
								</p>
							</div>
						</div>
						<div class="d-flex align-items-start">
							<button
								type="button"
								class={cx('btn btn-outline-secondary me-3 other', {
									active: OtherSelected,
								})}
								onClick={onOtherClick}
							>
								<div class="trash-type trash-type-other flex-shrink-0">
									<Frown class="icon" strokeWidth={1} />
								</div>
							</button>
							<div>
								<div class="form-check">
									<input
										class="form-check-input"
										type="checkbox"
										value=""
										id="otherCheck"
										checked={OtherSelected}
										onChange={onOtherClick}
									/>
									<label class="form-check-label" for="otherCheck">
										<strong>Other</strong>
									</label>
								</div>
								<p>
									Select this if the trash does not fit into any of the other
									categories.
									<br />
									<small class="text-muted">
										Please provide a description of the trash you are reporting.
									</small>
								</p>
							</div>
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
							onBlur={(e) => setDescription((e.target as any).value)}
							value={description}
						></textarea>
						<div id="helpBlock" class="form-text">
							Please provide any additional information that might help us with
							the cleanup, such as the exact location of the trash or any other
							relevant details.
						</div>
					</div>
				</div>
			</div>
			<div class="row justify-content-center mt-4">
				<div class="col-12 col-md-8 col-lg-6">
					<p class="d-flex justify-content-between align-items-center">
						<button
							onClick={() => route('/report/photos')}
							class="btn btn-outline-secondary"
						>
							Back
						</button>
						<button
							onClick={() => route('/report/preview')}
							class="btn btn-primary"
							disabled={trashType.length === 0}
						>
							Next
						</button>
					</p>
				</div>
			</div>
		</>
	)
}
