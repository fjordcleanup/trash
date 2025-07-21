import { Component } from 'preact'
import { route } from 'preact-router'

export class Redirect extends Component<{ to: string }> {
	override componentWillMount() {
		route(this.props.to, true)
	}

	render() {
		console.debug(`[Redirect]`, `Redirecting to ${this.props.to}`)
		return null
	}
}
