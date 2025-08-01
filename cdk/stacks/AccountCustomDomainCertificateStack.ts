import type { App, Environment } from 'aws-cdk-lib'
import {
	aws_certificatemanager as CertificateManager,
	CfnOutput,
	Stack,
} from 'aws-cdk-lib'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm'
import { ACCOUNT_DOMAIN_CERTIFICATE_STACK_NAME } from './stackName.ts'

/**
 * Certificates need to be in us-east-1 for CloudFront distributions.
 */
export class AccountCustomDomainCertificateStack extends Stack {
	public constructor(
		parent: App,
		{
			baseDomainName,
			env,
		}: {
			baseDomainName: string
			env: Environment
		},
	) {
		super(parent, ACCOUNT_DOMAIN_CERTIFICATE_STACK_NAME, {
			env: {
				...env,
				region: 'us-east-1', // Certificates must be in us-east-1 for CloudFront
			},
			description: `Provides the certificate for the custom domain on us-east-1.`,
		})

		// Look up the hosted zone for the base domain
		const hostedZone = HostedZone.fromLookup(this, 'hostedZone', {
			domainName: baseDomainName,
		})

		// Create certificate for the subdomain
		const certificate = new CertificateManager.Certificate(
			this,
			'certificate',
			{
				domainName: `auth.accounts.${baseDomainName}`,
				validation:
					CertificateManager.CertificateValidation.fromDns(hostedZone),
			},
		)

		// Make the DynamoDB table ARN available as a parameter
		// This will be read by the hosting stack using a custom resource
		// @see https://aws.amazon.com/blogs/infrastructure-and-automation/read-parameters-across-aws-regions-with-aws-cloudformation-custom-resources/
		const param = new StringParameter(this, 'certificateArnParameter', {
			parameterName: AccountCustomDomainCertificateStack.parameterName(),
			stringValue: certificate.certificateArn,
			description:
				'The ARN of the Parameter the contains the certificate ARN for the custom domain.',
			tier: ParameterTier.ADVANCED,
		})

		new CfnOutput(this, 'certificateArnParameterName', {
			value: param.parameterName,
			exportName: `${this.stackName}:certificateArnParameterName`,
		})

		new CfnOutput(this, 'certificateArnParameterArn', {
			value: param.parameterArn,
			exportName: `${this.stackName}:certificateArnParameterArn`,
		})
	}

	public static parameterName(): string {
		return `/${ACCOUNT_DOMAIN_CERTIFICATE_STACK_NAME}/certificateArn`
	}
}

export type StackOutputs = {
	certificateArnParameterName: string
	certificateArnParameterArn: string
}
