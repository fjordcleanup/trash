import type { LngLat } from 'maplibre-gl'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useState } from 'preact/hooks'

export const MarkerContext = createContext<{
	setLocation: (location: LngLat) => void
	location?: LngLat
}>({
	setLocation: () => {},
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [location, setLocation] = useState<LngLat>()

	return (
		<MarkerContext.Provider
			value={{
				setLocation,
				location,
			}}
		>
			{children}
		</MarkerContext.Provider>
	)
}

export const Consumer = MarkerContext.Consumer

export const useMarker = () => useContext(MarkerContext)
