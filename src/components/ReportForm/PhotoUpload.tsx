import { useState } from 'preact/hooks'

export const PhotoUpload = ({
	onImage,
}: {
	onImage: (image: Blob) => void
}) => {
	const [problem, setProblem] = useState<string | null>(null)

	return (
		<div class="row justify-content-center mb-4">
			<div class="col-12 col-md-8 col-lg-6">
				{problem !== null && <div class="alert alert-danger">{problem}</div>}
				<input
					type="file"
					accept="image/jpeg"
					onChange={(e) => {
						setProblem(null)
						if (e.target === null) return
						if (!('files' in e.target)) return
						const file = (e.target.files as FileList)[0]
						if (file === undefined) return
						if (file.type !== 'image/jpeg') return
						if (file.size < 2 * 1024 * 1024) {
							// Minimum size of 2MB
							setProblem('File is too small, please upload a larger image.')
							return
						}
						console.log('Selected file:', file)
						const reader = new FileReader()
						reader.onload = () => {
							if (reader.result instanceof ArrayBuffer) {
								const blob = new Blob([reader.result], { type: 'image/jpeg' })
								onImage(blob)
								console.log('Image loaded into blob:', blob)
							}
						}
						reader.readAsArrayBuffer(file)
					}}
				/>
			</div>
		</div>
	)
}
