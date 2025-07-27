import { Map } from '#components/Map.tsx'
import { Navbar } from '#components/Navbar.tsx'
import { ReportMap } from '#components/ReportMap.tsx'
import type { LngLat } from 'maplibre-gl'
import { useMemo, useState } from 'preact/hooks'
import proj4 from 'proj4'

const toEUREF89 = (gps: LngLat) => {
	// Define the projection from WGS84 (GPS) to EUREF89 UTM for the calculated zone
	const wgs84 = '+proj=longlat +datum=WGS84 +no_defs'
	const utm = `+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs`

	console.log(utm)

	// Transform the coordinates
	const [easting, northing] = (proj4 as any)(wgs84, utm, [gps.lng, gps.lat])

	return {
		easting,
		northing,
	}
}

export const Report = () => (
	<>
		<Navbar />
		<Map />
		<Main />
	</>
)

const Main = () => {
	const [location, setLocation] = useState<LngLat>()

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
			<Map />
			<main class="container mt-4">
				<div class="row justify-content-center">
					<div class="col-md-8 col-lg-6">
						<div class="card border-0 shadow rounded-3 mb-4">
							<div class="card-header bg-white p-4 pb-0">
								<h1 class="text-dark fs-1 mb-3">Report trash</h1>
								<p class="text-muted">
									<span>
										Note that we only accept reports for locations for trash
										that is in water bodies, such as the Oslo fjord, or
										Akerselva. If you found trash on land, please use{' '}
										<a href="https://www.fiksgatami.no/" target="_blank">
											fiksgatami.no
										</a>
										.
									</span>
								</p>
							</div>
							<div class="card-body">
								<h2 class="text-dark fs-2 mb-3">
									Select the location on the map
								</h2>
								<p>
									Click on the map to select a location where you found trash.
									You can drag the marker to adjust the position if needed.
								</p>
								<p class="text-muted">
									If you want to report multiple locations, please submit a
									separate report for each location.
								</p>
							</div>
							<ReportMap
								onClick={(lngLat) => setLocation(lngLat)}
								markerLocation={location}
							/>
							<div class="card-body">
								{location !== undefined && (
									<>
										<h3 class="text-dark fs-3 mb-3">Selected location</h3>
										<p>
											Longitude: {location.lng}
											<br />
											Latitude: {location.lat}
										</p>
										<p>View location on</p>
										<ul>
											<li>
												<a
													href={`https://kart.finn.no/?lng=${location.lng}&lat=${location.lat}&zoom=19&mapType=norortho&markers=${location.lng},${location.lat},r,Trash`}
													target="_blank"
												>
													kart.finn.no
												</a>
											</li>
											{utm !== null && (
												<li>
													<a
														href={`https://www.norgeskart.no/#!?project=norgeskart&layers=1001&zoom=17&lat=${utm.northing}&lon=${utm.easting}&markerLat=${utm.northing}&markerLon=${utm.easting}`}
														target="_blank"
													>
														Norgeskart
													</a>
												</li>
											)}
											<li>
												<a
													href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
													target="_blank"
												>
													Google Maps
												</a>
											</li>
										</ul>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}
