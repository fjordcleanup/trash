import { useMapSettings } from '#context/MapSettings.tsx'
import { useReports } from '#context/Reports.tsx'
import maplibregl from 'maplibre-gl'
import { route } from 'preact-router'
import { useEffect, useRef, useState } from 'preact/hooks'
import { TrashType } from '../../domain/TrashType.ts'

import 'maplibre-gl/dist/maplibre-gl.css'
import './Map.css'

const apiKey = MAP_API_KEY
const region = AWS_REGION
const style = 'Standard'
const colorScheme = 'Light'

export const Map = ({
	center,
	onClick,
}: {
	onClick?: () => void
	center?: { lat: number; lng: number }
}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const initialized = useRef<boolean>(false)
	const settings = useMapSettings()
	const { reports } = useReports()
	const [mapInstance, setMap] = useState<maplibregl.Map>()

	useEffect(() => {
		if (containerRef.current === null) return
		if (initialized.current) return
		initialized.current = true

		const map = new maplibregl.Map({
			container: containerRef.current,
			center: center ??
				settings.center ?? {
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

		map.on('click', () => {
			onClick?.()
		})

		return () => {
			console.debug(`[Map]`, `unmounted`)
			console.debug(`[Map]`, `cleaning up`)
			map.remove()
		}
	}, [containerRef, initialized])

	useEffect(() => {
		if (mapInstance === undefined) return
		const markers: Array<maplibregl.Marker> = []

		for (const report of reports) {
			const el = document.createElement('div')
			el.className = 'trash-marker'

			el.addEventListener('click', (ev) => {
				ev.stopPropagation()
				ev.preventDefault()
				if (report.$meta.id === undefined) return
				route(`/map/${report.$meta.id}`)
			})

			const escooterEl = document.createElement('div')
			escooterEl.className = report.type.includes(TrashType.Escooter)
				? 'escooter active'
				: 'escooter'
			el.appendChild(escooterEl)
			const bulkEl = document.createElement('div')
			bulkEl.className = report.type.includes(TrashType.Bulk)
				? 'bulk active'
				: 'bulk'
			el.appendChild(bulkEl)
			const litterEl = document.createElement('div')
			litterEl.className = report.type.includes(TrashType.Litter)
				? 'litter active'
				: 'litter'
			el.appendChild(litterEl)
			const otherEl = document.createElement('div')
			otherEl.className = report.type.includes(TrashType.Other)
				? 'other active'
				: 'other'
			el.appendChild(otherEl)

			const titleEl = document.createElement('div')
			titleEl.className = 'title'
			titleEl.textContent = report.$meta.id.slice(-6)
			el.appendChild(titleEl)

			// add marker to map
			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([report.location.lng, report.location.lat])
				.addTo(mapInstance)

			markers.push(marker)
		}

		return () => {
			console.debug(`[Map]`, `cleaning up markers`)
			markers.forEach((marker) => marker.remove())
		}
	}, [reports, mapInstance])

	return <div id="map" ref={containerRef} />
}
