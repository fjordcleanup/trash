import { ReportMap } from '#components/ReportMap.tsx'
import { LocateFixed, MapPin } from 'lucide-preact'
import type { LngLat } from 'maplibre-gl'
import { useMemo, useState } from 'preact/hooks'
import proj4 from 'proj4'

const toEUREF89 = (gps: LngLat) => {
	// Define the projection from WGS84 (GPS) to EUREF89 UTM for the calculated zone
	const wgs84 = '+proj=longlat +datum=WGS84 +no_defs'
	const utm = `+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs`

	// Transform the coordinates
	const [easting, northing] = (proj4 as any)(wgs84, utm, [gps.lng, gps.lat])

	return {
		easting,
		northing,
	}
}

export const SelectLocation = ({
	onLocation,
	selectedLocation,
}: {
	onLocation: (lngLat: LngLat) => void
	selectedLocation?: LngLat
}) => {
	const [location, setLocation] = useState<LngLat | undefined>(selectedLocation)

	const utm = useMemo(() => {
		if (location === undefined) return null
		const utm = toEUREF89(location)
		return {
			easting: utm.easting,
			northing: utm.northing,
		}
	}, [location])

	return (
		<>
			<div class="row justify-content-center">
				<div class="col-12 col-md-8 col-lg-6">
					<h1 class="fs-2 mb-3 d-flex align-items-center">
						<LocateFixed class="flex-shrink-0 me-2" size={24} />
						<span>Mark the spot</span>
					</h1>
					<p>
						Click on the map to select a location where you found trash. You can
						drag the marker to adjust the position if needed.
					</p>
				</div>
			</div>
			<div class="row justify-content-center mb-2">
				<div class="col-12 col-md-8">
					<ReportMap
						onClick={(lngLat) => {
							onLocation(lngLat)
							setLocation(lngLat)
						}}
						markerLocation={location}
					/>
				</div>
			</div>

			{location !== undefined && (
				<>
					<div class="row  justify-content-center">
						<div class="col-12 col-md-8 col-lg-6">
							<h3 class="text-dark fs-3 mb-3 mt-4">Selected location</h3>
						</div>
					</div>
					<div class="row justify-content-center">
						<div class="col-12 col-md-8 col-lg-6">
							<p class="d-flex align-items-center">
								<MapPin class="flex-shrink-0 me-1" size={24} />
								{location.lat},{location.lng}
							</p>
							<p>
								View location on:
								<a
									href={`https://kart.finn.no/?lng=${location.lng}&lat=${location.lat}&zoom=19&mapType=norortho&markers=${location.lng},${location.lat},r,Trash`}
									target="_blank"
									class="ms-2"
								>
									kart.finn.no
								</a>
								{utm !== null && (
									<a
										href={`https://www.norgeskart.no/#!?project=norgeskart&layers=1001&zoom=17&lat=${utm.northing}&lon=${utm.easting}&markerLat=${utm.northing}&markerLon=${utm.easting}`}
										target="_blank"
										class="ms-2"
									>
										Norgeskart
									</a>
								)}
								<a
									href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
									target="_blank"
									class="ms-2"
								>
									Google Maps
								</a>
							</p>
						</div>
					</div>
				</>
			)}
		</>
	)
}
