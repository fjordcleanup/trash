import type { PhotoSize } from '@fjordcleanup/trash-proto'

export type SizedPhoto = {
	[PhotoSize.placeholder]: string
	[PhotoSize.thumbnail]: string
	[PhotoSize.scaled]: string
}
