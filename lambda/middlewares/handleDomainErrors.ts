import { aProblem } from '@hello.nrfcloud.com/lambda-helpers/aProblem'
import { ValidationFailedError } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import { formatTypeBoxErrors } from '@hello.nrfcloud.com/proto'
import { HttpStatusCode } from '@hello.nrfcloud.com/proto/hello'
import type { MiddlewareObj } from '@middy/core'
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyStructuredResultV2,
	Context as LambdaContext,
} from 'aws-lambda'
import { AccessDeniedError } from '../error/AccessDeniedError.ts'

export const handleDomainErrors = (): MiddlewareObj<
	APIGatewayProxyEvent,
	APIGatewayProxyStructuredResultV2,
	Error,
	LambdaContext
> => ({
	onError: async (req) => {
		if (req.response !== undefined) return

		if (req.error instanceof ValidationFailedError) {
			req.response = aProblem({
				status: HttpStatusCode.BAD_REQUEST,
				title: 'Invalid input',
				detail: formatTypeBoxErrors(req.error.errors),
			})
			return
		}

		if (req.error instanceof AccessDeniedError) {
			req.response = aProblem({
				status: HttpStatusCode.FORBIDDEN,
				title: 'Access denied',
				detail: req.error.message,
			})
			return
		}

		console.error('[handleDomainErrors]', JSON.stringify(req.error))
		req.response = aProblem({
			status: HttpStatusCode.INTERNAL_SERVER_ERROR,
			title:
				req.error instanceof Error
					? req.error.message
					: 'Internal Server Error',
			detail: req.error instanceof Error ? req.error.name : undefined,
		})
		req.error = null
	},
})
