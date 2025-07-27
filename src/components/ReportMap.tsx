import maplibregl, { LngLat, Marker, type LngLatLike } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'preact/hooks'

import { Locate, Map, Satellite } from 'lucide-preact'
import 'maplibre-gl/dist/maplibre-gl.css'
import './ReportMap.css'

const apiKey = MAP_API_KEY
const region = AWS_REGION
const colorScheme = 'Light'

export const ReportMap = ({
	markerLocation,
	onClick,
}: {
	markerLocation?: LngLat
	onClick?: (lngLat: LngLat) => void
}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [mapInstance, setMap] = useState<maplibregl.Map>()
	const [style, setStyle] = useState<'Satellite' | 'Standard'>('Standard')
	const [zoom, setZoom] = useState(13)
	const [center, setCenter] = useState<LngLatLike>([
		10.7496181292028, 59.905900733292235,
	])

	useEffect(() => {
		if (containerRef.current === null) return

		const map = new maplibregl.Map({
			container: containerRef.current,
			center,
			zoom,
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
			onClick?.(lngLat)
		})

		map.on('zoomend', () => {
			const currentZoom = map.getZoom()
			setZoom(currentZoom)
		})

		map.on('moveend', () => {
			const currentCenter = map.getCenter()
			console.debug(`[Map]`, `moved to`, currentCenter)
			setCenter(currentCenter)
		})

		return () => {
			console.debug(`[Map]`, `unmounted`)
			console.debug(`[Map]`, `cleaning up`)
			map.remove()
		}
	}, [containerRef, style])

	useEffect(() => {
		if (mapInstance === undefined) return
		if (markerLocation === undefined) return

		console.debug(`[Map]`, `updating marker location to`, markerLocation)
		const marker = new Marker({
			color: '#ff6100',
			draggable: true,
		})
			.setLngLat(markerLocation)
			.addTo(mapInstance)

		marker.on('dragend', () => {
			const lngLat = marker.getLngLat()
			console.debug(`[Map]`, `marker dragged to`, lngLat)
			onClick?.(lngLat)
		})

		return () => {
			marker.remove()
			console.debug(`[Map]`, `marker removed`)
		}
	}, [markerLocation, mapInstance])

	return (
		<div id="reportMapContainer">
			<div id="reportMap" ref={containerRef} />
			<nav>
				{style === 'Satellite' ? (
					<button
						type="button"
						class="btn btn-secondary d-flex align-items-center flex-column"
						onClick={() => setStyle('Standard')}
						title="Terrain view"
					>
						<Map />
					</button>
				) : (
					<button
						type="button"
						class="btn btn-secondary d-flex align-items-center flex-column"
						onClick={() => setStyle('Satellite')}
						title="Satellite view"
					>
						<Satellite />
					</button>
				)}

				{navigator.geolocation !== undefined && (
					<button
						type="button"
						class="btn btn-secondary d-flex align-items-center flex-column mt-2"
						onClick={() => {
							navigator.geolocation.getCurrentPosition(
								(position) => {
									const { latitude, longitude } = position.coords
									mapInstance?.flyTo({
										center: new LngLat(longitude, latitude),
									})
									setCenter(new LngLat(longitude, latitude))
								},
								(error) => {
									console.error('Error getting location:', error.message)
									alert(
										'Unable to retrieve your location. Please ensure location access is enabled.',
									)
								},
								{ enableHighAccuracy: true },
							)
						}}
						title="Locate me"
					>
						<Locate />
					</button>
				)}
			</nav>
		</div>
	)
}
