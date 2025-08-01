import cx from 'classnames'
import { useRef, useState } from 'preact/hooks'

export const Photo = ({ url }: { url: URL }) => {
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
