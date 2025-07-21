import { Map } from '#components/Map.tsx'
import { Navbar } from '#components/Navbar.tsx'
import { Provider as MarkerProvider, useMarker } from '#context/Marker.tsx'
import { Locate } from 'lucide-preact'
import { LngLat } from 'maplibre-gl'

export const Report = () => (
	<>
		<Navbar />
		<MarkerProvider>
			<Map />
			<Main />
		</MarkerProvider>
	</>
)

const Main = () => {
	const marker = useMarker()

	return (
		<>
			<Map />
			<main class="container mt-4">
				<div class="row justify-content-center">
					<div class="col-md-8 col-lg-5">
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
								{navigator.geolocation !== undefined && (
									<p>
										<button
											type="button"
											class="btn btn-primary"
											onClick={() => {
												navigator.geolocation.getCurrentPosition(
													(position) => {
														const { latitude, longitude } = position.coords
														marker.setLocation(new LngLat(longitude, latitude))
													},
													(error) => {
														console.error(
															'Error getting location:',
															error.message,
														)
														alert(
															'Unable to retrieve your location. Please ensure location access is enabled.',
														)
													},
													{ enableHighAccuracy: true },
												)
											}}
										>
											<Locate class="me-2" />
											use my location
										</button>
									</p>
								)}

								{marker.location !== undefined && (
									<p>
										Selected location: {marker.location.lng},{' '}
										{marker.location.lat}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}
