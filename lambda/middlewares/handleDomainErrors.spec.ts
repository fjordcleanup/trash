import { AccessDeniedError } from '#domain/error/AccessDeniedError.ts'
import { ConflictError } from '#domain/error/ConflictError.ts'
import { NotFoundError } from '#domain/error/NotFoundError.ts'
import { ValidationFailedError } from '@hello.nrfcloud.com/lambda-helpers/validateInput'
import { HttpStatusCode } from '@hello.nrfcloud.com/proto/hello'
import type { Request } from '@middy/core'
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyStructuredResultV2,
	Context as LambdaContext,
} from 'aws-lambda'
import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { handleDomainErrors } from './handleDomainErrors.ts'

const createMockRequest = (
	error: Error,
	response?: APIGatewayProxyStructuredResultV2,
): Request<
	APIGatewayProxyEvent,
	APIGatewayProxyStructuredResultV2,
	Error,
	LambdaContext
> => ({
	event: {} as APIGatewayProxyEvent,
	context: {} as LambdaContext,
	response: response ?? null,
	error,
	internal: {},
})

void describe('handleDomainErrors middleware', () => {
	void describe('ValidationFailedError', () => {
		void it('should handle ValidationFailedError with BAD_REQUEST status', async () => {
			// Create a mock validation error with the structure expected by the ValidationFailedError
			const mockErrors = [
				{
					type: 'object',
					schema: { type: 'object' },
					path: '/email',
					value: 'invalid-email',
					message: 'must match format "email"',
					errors: undefined,
				},
			] as any[]

			const validationError = new ValidationFailedError(mockErrors)

			const req = createMockRequest(validationError)

			await handleDomainErrors(undefined).onError!(req)

			assert.ok(req.response, 'Response should be set')
			assert.equal(req.response?.statusCode, HttpStatusCode.BAD_REQUEST)
			assert.equal(
				req.response?.headers?.['content-type'],
				'application/problem+json',
			)

			const body = JSON.parse(req.response?.body ?? '{}')
			assert.equal(body.status, HttpStatusCode.BAD_REQUEST)
			assert.equal(body.title, 'Invalid input')
			assert.ok(body.detail !== undefined)
		})
	})

	void describe('AccessDeniedError', () => {
		void it('should handle AccessDeniedError with FORBIDDEN status', async () => {
			const error = new AccessDeniedError(
				'User not authorized to access this resource',
			)

			const req = createMockRequest(error)

			await handleDomainErrors(undefined).onError!(req)

			assert.equal(req.response?.statusCode, HttpStatusCode.FORBIDDEN)
			assert.equal(
				req.response?.headers?.['content-type'],
				'application/problem+json',
			)

			const body = JSON.parse(req.response?.body ?? '{}')
			assert.equal(body.status, HttpStatusCode.FORBIDDEN)
			assert.equal(body.title, 'Access denied')
			assert.equal(body.detail, 'User not authorized to access this resource')
		})
	})

	void describe('NotFoundError', () => {
		void it('should handle NotFoundError with NOT_FOUND status', async () => {
			const error = new NotFoundError('Resource with ID 123 not found')

			const req = createMockRequest(error)

			await handleDomainErrors(undefined).onError!(req)

			assert.equal(req.response?.statusCode, HttpStatusCode.NOT_FOUND)
			assert.equal(
				req.response?.headers?.['content-type'],
				'application/problem+json',
			)

			const body = JSON.parse(req.response?.body ?? '{}')
			assert.equal(body.status, HttpStatusCode.NOT_FOUND)
			assert.equal(body.title, 'Not Found')
			assert.equal(body.detail, 'Resource with ID 123 not found')
		})
	})

	void describe('ConflictError', () => {
		void it('should handle ConflictError with CONFLICT status', async () => {
			const error = new ConflictError(
				'Resource already exists with this identifier',
			)

			const req = createMockRequest(error)

			await handleDomainErrors(undefined).onError!(req)

			assert.equal(req.response?.statusCode, HttpStatusCode.CONFLICT)
			assert.equal(
				req.response?.headers?.['content-type'],
				'application/problem+json',
			)

			const body = JSON.parse(req.response?.body ?? '{}')
			assert.equal(body.status, HttpStatusCode.CONFLICT)
			assert.equal(body.title, 'Conflict')
			assert.equal(body.detail, 'Resource already exists with this identifier')
		})
	})

	void describe('Generic Error handling', () => {
		void it('should handle generic Error with INTERNAL_SERVER_ERROR status', async () => {
			const consoleMock = mock.fn<typeof console.error>(() => {})

			const error = new Error('Something went wrong')
			error.name = 'CustomError'

			const req = createMockRequest(error)

			await handleDomainErrors(consoleMock).onError!(req)

			assert.equal(
				req.response?.statusCode,
				HttpStatusCode.INTERNAL_SERVER_ERROR,
			)
			assert.equal(
				req.response?.headers?.['content-type'],
				'application/problem+json',
			)

			const body = JSON.parse(req.response?.body ?? '{}')
			assert.equal(body.status, HttpStatusCode.INTERNAL_SERVER_ERROR)
			assert.equal(body.title, 'Something went wrong')
			assert.equal(body.detail, 'CustomError')
			assert.equal(req.error, null)

			// Verify console.error was called
			assert.equal(consoleMock.mock.callCount(), 1)
			assert.equal(
				consoleMock.mock.calls[0]?.arguments[0],
				'[handleDomainErrors]',
			)

			consoleMock.mock.restore()
		})
	})

	void describe('Early return behavior', () => {
		void it('should not modify request if response is already set', async () => {
			const existingResponse: APIGatewayProxyStructuredResultV2 = {
				statusCode: 200,
				body: JSON.stringify({ message: 'Success' }),
			}

			const error = new NotFoundError('This should be ignored')
			const req = createMockRequest(error, existingResponse)

			await handleDomainErrors(undefined).onError!(req)

			// Response should remain unchanged
			assert.deepStrictEqual(req.response, existingResponse)
			// Error should remain unchanged
			assert.equal(req.error, error)
		})
	})
})
