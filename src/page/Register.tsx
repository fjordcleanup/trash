import { Map } from '#components/Map.tsx'
import { Navbar } from '#components/Navbar.tsx'
import { useAuth } from '#context/Auth.tsx'

export const Register = () => {
	const auth = useAuth()
	return (
		<>
			<Navbar />
			<Map />
			<main class="container mt-4">
				<div class="row justify-content-center">
					<div class="col-md-5">
						<div class="card border-0 shadow rounded-3 mb-4">
							<div class="card-header bg-white p-4 pb-0">
								<h1 class="text-dark fs-1 mb-3">Registration</h1>
							</div>
							<div class="card-body">
								<p>
									For reporting trash and other features a user account is
									required so we can reach you and ensure a safe experience.
								</p>
								<button
									type="button"
									class="btn btn-primary"
									onClick={() => auth.login()}
								>
									Register or Log in
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}
