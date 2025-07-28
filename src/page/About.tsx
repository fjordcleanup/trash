import { Footer } from '#components/Footer.tsx'
import { Navbar } from '#components/Navbar.tsx'

export const About = () => (
	<>
		<Navbar />
		<main class="container">
			<div class="row justify-content-center">
				<div class="col-12 col-md-6">
					<p>Hello!</p>
					<h2>Acknowledgements</h2>
					<p>eScooter icon created by Daniel T. for the Noun Project.</p>
					<p>Tire icon created by Upnow Graphic for the Noun Project.</p>
					<p>Trash icon created by Ferifrey for the Noun Project.</p>
				</div>
			</div>
		</main>
		<Footer />
	</>
)
