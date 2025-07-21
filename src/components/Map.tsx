import maplibregl, { Marker } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'preact/hooks'

import { useMarker } from '#context/Marker.tsx'
import 'maplibre-gl/dist/maplibre-gl.css'
import './Map.css'

const apiKey = MAP_API_KEY
const region = AWS_REGION
const style = 'Standard'
const colorScheme = 'Light'

export const Map = () => {
	const containerRef = useRef<HTMLDivElement>(null)
	const initialized = useRef<boolean>(false)
	const [mapInstance, setMap] = useState<maplibregl.Map>()
	const marker = useMarker()

	useEffect(() => {
		if (containerRef.current === null) return
		if (initialized.current) return
		initialized.current = true

		const map = new maplibregl.Map({
			container: containerRef.current,
			center: {
				lng: 10.7496181292028,
				lat: 59.905900733292235,
			},
			zoom: 13,
			style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${style}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`,
			refreshExpiredTiles: false,
			trackResize: true,
			keyboard: false,
			renderWorldCopies: false,
		})

		map.on('load', () => {
			console.debug(`[Map]`, `loaded`)
			setMap(map)
		})

		map.on('click', (e) => {
			const lngLat = e.lngLat
			console.debug(`[Map]`, `clicked at`, lngLat)
			marker.setLocation(lngLat)
		})

		return () => {
			console.debug(`[Map]`, `unmounted`)
			console.debug(`[Map]`, `cleaning up`)
			map.remove()
		}
	}, [containerRef, initialized])

	useEffect(() => {
		if (mapInstance === undefined) return
		if (marker.location === undefined) return

		console.debug(`[Map]`, `updating marker location to`, marker.location)
		const markerIcon = new Marker({
			color: '#ff6100',
			draggable: true,
		})
			.setLngLat(marker.location)
			.addTo(mapInstance)

		return () => {
			markerIcon.remove()
			console.debug(`[Map]`, `marker removed`)
		}
	}, [marker.location, mapInstance])

	return <div id="map" ref={containerRef} />
}
