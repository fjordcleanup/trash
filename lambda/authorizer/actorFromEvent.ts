import type { AuthorizedEvent } from './AuthorizedEvent.ts'
import type { CognitoClaims } from './CognitoClaims.ts'

export const actorFromEvent = (event: AuthorizedEvent<CognitoClaims>): string =>
	`${event.requestContext.authorizer.claims.iss}:${event.requestContext.authorizer.claims.sub}`
