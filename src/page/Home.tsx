import { Footer } from '#components/Footer.tsx'
import { Navbar } from '#components/Navbar.tsx'

export const Home = () => (
	<>
		<Navbar />
		<main class="container">
			<div class="row justify-content-center">
				<div class="col-12 col-md-6">
					<p>Hello!</p>
				</div>
			</div>
		</main>
		<Footer />
	</>
)
