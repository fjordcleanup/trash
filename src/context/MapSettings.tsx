import type { LngLat } from 'maplibre-gl'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useState } from 'preact/hooks'

export const MapSettingsContext = createContext<{
	setCenter: (location: LngLat) => void
	center?: LngLat
}>({
	setCenter: () => {},
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [location, setLocation] = useState<LngLat>()

	return (
		<MapSettingsContext.Provider
			value={{
				setCenter: setLocation,
				center: location,
			}}
		>
			{children}
		</MapSettingsContext.Provider>
	)
}

export const Consumer = MapSettingsContext.Consumer

export const useMapSettings = () => useContext(MapSettingsContext)
