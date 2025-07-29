import maplibregl, { type LngLat, Marker } from 'maplibre-gl'
import { useEffect, useRef } from 'preact/hooks'

import 'maplibre-gl/dist/maplibre-gl.css'
import './MiniMap.css'

const apiKey = MAP_API_KEY
const region = AWS_REGION
const colorScheme = 'Light'
const style = 'Standard'

export const MiniMap = ({ markerLocation }: { markerLocation: LngLat }) => {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (containerRef.current === null) return

		const map = new maplibregl.Map({
			container: containerRef.current,
			center: markerLocation,
			zoom: 12,
			style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${style}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`,
			refreshExpiredTiles: false,
			trackResize: true,
			keyboard: false,
			renderWorldCopies: false,
			attributionControl: {
				compact: true,
			},
		})

		const marker = new Marker({
			color: 'var(--fjordcleanup-color)',
			draggable: false,
		})
			.setLngLat(markerLocation)
			.addTo(map)

		return () => {
			console.debug(`[Map]`, `unmounted`)
			console.debug(`[Map]`, `cleaning up`)
			marker.remove()
			map.remove()
		}
	}, [containerRef, style])

	return <div id="miniMap" ref={containerRef} />
}
