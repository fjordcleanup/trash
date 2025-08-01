import { Map } from '#components/Map.tsx'
import { Navbar } from '#components/Navbar.tsx'
import { useMemo } from 'preact/hooks'

export const Home = () => {
	const hashSettings = useMemo(
		() =>
			Object.fromEntries(
				(window.location.hash?.slice(1) ?? '')
					.split(';')
					.map((s) => s.split(':')),
			),
		[],
	)

	const center = useMemo(() => {
		if (hashSettings.center === undefined) return
		const [lat, lng] = hashSettings.center.split(',').map(Number)
		if (isNaN(lat) || isNaN(lng)) return
		return { lat, lng }
	}, [hashSettings])

	return (
		<>
			<Map center={center} />
			<Navbar />
		</>
	)
}
