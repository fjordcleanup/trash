import { Arn, Stack } from 'aws-cdk-lib'
import * as CustomResource from 'aws-cdk-lib/custom-resources'
import type { Construct } from 'constructs'

const removeLeadingSlash = (value: string): string =>
	value.startsWith('/') ? value.slice(1) : value

/**
 * Custom resource to read an SSM parameter.
 * This is useful for reading parameters across regions.
 * @see https://aws.amazon.com/blogs/infrastructure-and-automation/read-parameters-across-aws-regions-with-aws-cloudformation-custom-resources/
 */
export class SSMParameterReader extends CustomResource.AwsCustomResource {
	constructor(
		scope: Construct,
		name: string,
		{
			parameterName,
			region,
		}: {
			parameterName: string
			region: string
		},
	) {
		const ssmAwsSdkCall: CustomResource.AwsSdkCall = {
			service: 'SSM',
			action: 'getParameter',
			parameters: {
				Name: parameterName,
			},
			region,
			physicalResourceId: CustomResource.PhysicalResourceId.of(
				Date.now().toString(),
			),
		}

		const ssmCrPolicy = CustomResource.AwsCustomResourcePolicy.fromSdkCalls({
			resources: [
				Arn.format(
					{
						service: 'ssm',
						region,
						resource: 'parameter',
						resourceName: removeLeadingSlash(parameterName),
					},
					Stack.of(scope),
				),
			],
		})

		super(scope, name, { onUpdate: ssmAwsSdkCall, policy: ssmCrPolicy })
	}

	public getParameterValue(): string {
		return this.getResponseField('Parameter.Value').toString()
	}
}
