import { useRef, useState } from 'preact/hooks'

export const PhotoUpload = ({
	onImage,
}: {
	onImage: (image: Blob) => void
}) => {
	const [problem, setProblem] = useState<string | null>(null)
	const ref = useRef<HTMLInputElement>(null)

	return (
		<div class="row justify-content-center mb-4">
			<div class="col-12 col-md-8 col-lg-6">
				{problem !== null && <div class="alert alert-danger">{problem}</div>}
				<input
					type="file"
					accept="image/jpeg"
					ref={ref}
					class="btn btn-primary"
					onChange={(e) => {
						setProblem(null)
						if (e.target === null) return
						if (!('files' in e.target)) return
						const file = (e.target.files as FileList)[0]
						if (file === undefined) return
						if (file.type !== 'image/jpeg') return
						if (file.size < 100 * 1024) {
							// Minimum size of 100 KB
							setProblem('File is too small, please select a larger image.')
							return
						}
						if (file.size > 20 * 1024 * 1024) {
							// Maximum size of 20MB
							setProblem('File is too large, please select a smaller image.')
							return
						}
						const reader = new FileReader()
						reader.onload = () => {
							if (reader.result instanceof ArrayBuffer) {
								const blob = new Blob([reader.result], { type: 'image/jpeg' })
								onImage(blob)
							}
						}
						reader.readAsArrayBuffer(file)

						if (ref.current !== null) {
							ref.current.value = ''
						}
					}}
				/>
			</div>
		</div>
	)
}
