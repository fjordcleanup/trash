import { Home, LogIn, LogOut } from 'lucide-preact'
import { useAuth } from '#context/Auth.tsx'

import './Navbar.css'

export const Navbar = () => (
	<>
		<Nav />
	</>
)

const Nav = () => {
	const auth = useAuth()
	const { email, name } = auth.user?.profile ?? {}
	return (
		<div class="topNav mb-4">
			<nav class="left">
				<img
					src="/static/logo.webp"
					alt="Fjord CleanUP"
					class="logo"
				/>
				<a href="/" class="ms-2">
					<Home /> Home
				</a>
			</nav>
			<nav class="right">
				{auth.user === undefined && <button
					type="button"
					class="btn btn-success"
					onClick={() => auth.login()}
				>
					<LogIn class="me-2" />
					Login
				</button>}
				{auth.user !== undefined &&
					<>
						{email}
						{name !== undefined ? <span class="ms-2">({name})</span> : null}
						<button
							type="button"
							class="btn btn-danger"
							onClick={() => auth.logout()}
						>
							<LogOut class="me-2" />
							Logout
						</button></>
				}
			</nav>
		</div>
	)
}
