import { formatDistanceToNow } from 'date-fns'
import { render } from 'preact'
import '../src/base.css'
import { App } from './App.tsx'

console.debug('version', VERSION)
console.debug(
	'build time',
	BUILD_TIME,
	formatDistanceToNow(new Date(BUILD_TIME), {
		addSuffix: true,
	}),
)

console.debug('MAP_API_KEY', MAP_API_KEY)
console.debug('COGNITO_USER_POOL_URL', COGNITO_USER_POOL_URL)
console.debug('COGNITO_IDENTITY_POOL_ID', COGNITO_IDENTITY_POOL_ID)
console.debug('COGNITO_USER_POOL_CLIENT_ID', COGNITO_USER_POOL_CLIENT_ID)

const root = document.getElementById('root')

if (root === null) {
	console.error(`Could not find root element!`)
} else {
	render(<App />, root)
}
