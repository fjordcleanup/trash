import { useAuth } from '#context/Auth.tsx'
import {
	HelpCircle,
	Home,
	LogIn,
	LogOut,
	Menu,
	PlusCircle,
	User,
	UserStar,
	X,
} from 'lucide-preact'
import { useState } from 'preact/hooks'

import './Navbar.css'

export const Navbar = () => <Nav />

const Nav = () => {
	const auth = useAuth()
	const { email, name } = auth.user?.profile ?? {}
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
	const closeMobileMenu = () => setIsMobileMenuOpen(false)

	return (
		<div class="topNav">
			<nav class="left d-flex">
				<img src="/static/logo.webp" alt="Fjord CleanUP" class="logo" />
				<div class="mobile-nav">
					<a href="/report" class="ms-2 d-flex align-items-center me-2">
						<PlusCircle class="me-2" /> Report
					</a>
				</div>
				<div class="desktop-nav">
					<a href="/" class="ms-2 d-flex align-items-center me-2">
						<Home class="me-2" /> Home
					</a>
					<a href="/report" class="ms-2 d-flex align-items-center me-2">
						<PlusCircle class="me-2" /> Report
					</a>
					<a href="/about" class="ms-2 d-flex align-items-center">
						<HelpCircle class="me-2" /> About
					</a>
				</div>
			</nav>
			<nav class="right">
				<div class="desktop-auth">
					{auth.user === undefined && (
						<button
							type="button"
							class="btn btn-success"
							onClick={() => auth.login()}
						>
							<LogIn class="me-2" />
							Log in
						</button>
					)}
					{auth.user !== undefined && (
						<>
							<div class="d-flex align-items-center">
								<UserRoleIcon isAdmin={auth.isAdmin} />
								{name ?? email}
							</div>
							<button
								type="button"
								class="btn btn-outline-danger"
								onClick={() => auth.logout()}
							>
								<LogOut class="me-2" />
								Logout
							</button>
						</>
					)}
				</div>
				<button
					type="button"
					class="mobile-menu-toggle"
					onClick={toggleMobileMenu}
					aria-label="Toggle mobile menu"
				>
					{isMobileMenuOpen ? <X /> : <Menu />}
				</button>
			</nav>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div class="mobile-menu">
					<div class="mobile-menu-content">
						<a href="/" class="mobile-menu-item" onClick={closeMobileMenu}>
							<Home /> Home
						</a>
						<a
							href="/report"
							class="mobile-menu-item"
							onClick={closeMobileMenu}
						>
							<PlusCircle /> Report
						</a>
						<a href="/about" class="mobile-menu-item" onClick={closeMobileMenu}>
							<HelpCircle /> About
						</a>

						<div class="mobile-menu-auth">
							{auth.user === undefined && (
								<button
									type="button"
									class="btn btn-success mobile-auth-btn"
									onClick={() => {
										auth.login()
										closeMobileMenu()
									}}
								>
									<LogIn class="me-2" />
									Log in
								</button>
							)}
							{auth.user !== undefined && (
								<>
									<div class="mobile-user-info d-flex align-items-center">
										<UserRoleIcon isAdmin={auth.isAdmin} />
										{name ?? email}
									</div>
									<button
										type="button"
										class="btn btn-outline-danger mobile-auth-btn"
										onClick={() => {
											auth.logout()
											closeMobileMenu()
										}}
									>
										<LogOut class="me-2" />
										Logout
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

const UserRoleIcon = ({ isAdmin }: { isAdmin: boolean }) =>
	isAdmin ? (
		<abbr title="Admin">
			<UserStar class="me-1 color-fjordcleanup" />
		</abbr>
	) : (
		<User class="me-1" />
	)
