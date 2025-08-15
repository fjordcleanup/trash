import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { stackOutput } from '@bifravst/cloudformation-helpers'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { StackOutputs as PublicAPIStackName } from '../cdk/stacks/PublicAPIStack.ts'
import { PUBLIC_API_STACK_NAME } from '../cdk/stacks/stackName.ts'

const cf = new CloudFormationClient({})

const { apiURL } = await stackOutput(cf)<PublicAPIStackName>(
	PUBLIC_API_STACK_NAME,
)

void describe('Public API', () => {
	void describe('List reports', () => {
		void it('should return a list of reports', async () => {
			const response = await fetch(`${apiURL}/reports`)
			assert.equal(response.status, 200)
			assert.equal(
				response.headers.get('x-backend-version'),
				'0.0.0-development',
				'The x-backend-version header should be sent',
			)
			const page = await response.json()
			assert.deepEqual(page, {
				'@context': 'https://trash.fjordcleanup.org/#context/page',
				'@item-context': 'https://trash.fjordcleanup.org/#context/report',
				items: [],
			})
		})
	})
})
