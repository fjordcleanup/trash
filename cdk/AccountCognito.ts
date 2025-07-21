import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
	CfnIdentityPool,
	CfnIdentityPoolRoleAttachment,
	CfnManagedLoginBranding,
	ManagedLoginVersion,
	OAuthScope,
	PasskeyUserVerification,
	UserPool,
	UserPoolClient,
	UserPoolClientIdentityProvider,
	UserPoolDomain,
	type IUserPool,
	type IUserPoolClient,
} from 'aws-cdk-lib/aws-cognito'
import { Role, WebIdentityPrincipal } from 'aws-cdk-lib/aws-iam'
import {
	ARecord,
	CnameRecord,
	HostedZone,
	RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import { AccountCustomDomainCertificateStack } from './AccountCustomDomainCertificateStack.ts'
import { SSMParameterReader } from './SSMParameterReader.ts'
import { STACK_PREFIX } from './stackName.ts'

export class AccountCognito extends Construct {
	public readonly userPool: IUserPool
	public readonly userPoolClient: IUserPoolClient
	public readonly identityPool: CfnIdentityPool
	public readonly adminsRole: Role

	constructor(
		parent: Construct,
		{
			baseDomainName,
		}: {
			baseDomainName: string
		},
	) {
		super(parent, AccountCognito.name)

		// Create UserPool
		this.userPool = new UserPool(this, 'users', {
			userPoolName: `${STACK_PREFIX}-accounts`,
			selfSignUpEnabled: true,
			standardAttributes: {
				email: {
					required: true,
					mutable: true,
				},
				fullname: {
					required: true,
					mutable: true,
				},
			},
			autoVerify: {
				email: true,
			},
			signInPolicy: {
				allowedFirstAuthFactors: {
					// The password authentication cannot be disabled right now.
					password: true,
					emailOtp: true,
					passkey: true,
				},
			},
			passkeyUserVerification: PasskeyUserVerification.PREFERRED,
			// signInCaseSensitive: false,
		})

		const hostedZone = HostedZone.fromLookup(this, 'hostedZone', {
			domainName: baseDomainName,
		})

		// Create an A record that resolves the zone name to 1.1.1.1
		// This is needed for the custom domain: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html#cognito-user-pools-add-custom-domain-prereq
		const dummyRecord = new ARecord(this, 'ARecord', {
			zone: hostedZone,
			recordName: `accounts.${baseDomainName}`,
			target: RecordTarget.fromIpAddresses('1.1.1.1'),
		})

		// Reference the certificate ARN from the custom domain certificate stack using a custom resource
		// This is necessary because the certificate must be in us-east-1 for CloudFront
		// and the hosting stack may be in a different region.
		// The certificate ARN is stored in an SSM parameter by the custom domain certificate stack
		// @see https://aws.amazon.com/blogs/infrastructure-and-automation/read-parameters-across-aws-regions-with-aws-cloudformation-custom-resources/
		const certificateArnReader = new SSMParameterReader(
			this,
			'CertificateARNReader',
			{
				parameterName: AccountCustomDomainCertificateStack.parameterName(),
				region: 'us-east-1', // Certificates must be in us-east-1 for CloudFront
			},
		)

		const certificate = Certificate.fromCertificateArn(
			this,
			'userPoolDomainCertificate',
			certificateArnReader.getParameterValue(),
		)

		// Create UserPool Domain for Managed Login

		const userPoolDomain = new UserPoolDomain(this, 'userPoolDomain', {
			userPool: this.userPool,
			customDomain: {
				certificate,
				domainName: `auth.accounts.${baseDomainName}`,
			},
			managedLoginVersion: ManagedLoginVersion.NEWER_MANAGED_LOGIN,
		})
		userPoolDomain.node.addDependency(dummyRecord)

		// This is needed for the custom domain to work: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html#cognito-user-pools-add-custom-domain-console-step-2
		new CnameRecord(this, 'CNAMERecord', {
			zone: hostedZone,
			recordName: `auth.accounts.${baseDomainName}`,
			domainName: userPoolDomain.cloudFrontEndpoint,
		})

		this.userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
			userPool: this.userPool,
			userPoolClientName: 'managedLogin',
			generateSecret: false,
			authFlows: {
				userPassword: false,
				userSrp: false,
				custom: false,
				user: true,
			},
			oAuth: {
				flows: {
					authorizationCodeGrant: true,
				},
				scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
				callbackUrls: [
					`https://trash.${baseDomainName}/auth/callback`,
					`http://localhost:8080/auth/callback`,
				],
				logoutUrls: [
					`https://trash.${baseDomainName}/`,
					`http://localhost:8080/`,
				],
			},
			supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
		})

		// Create Managed Login Branding
		new CfnManagedLoginBranding(this, 'ManagedLoginBranding', {
			userPoolId: this.userPool.userPoolId,
			clientId: this.userPoolClient.userPoolClientId,
			useCognitoProvidedValues: true,
		})

		// We cannot use the L2 construct here, because it creates a circular dependency:
		// See https://github.com/aws/aws-cdk/issues/33725
		this.identityPool = new CfnIdentityPool(this, 'identityPool', {
			allowUnauthenticatedIdentities: false,
			cognitoIdentityProviders: [
				{
					clientId: this.userPoolClient.userPoolClientId,
					providerName: this.userPool.userPoolProviderName,
				},
			],
		})

		// Create a role for billing admins
		const identityPoolPrincipal = new WebIdentityPrincipal(
			'cognito-identity.amazonaws.com',
			{
				StringEquals: {
					'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
				},
				'ForAnyValue:StringLike': {
					'cognito-identity.amazonaws.com:amr': 'authenticated',
				},
			},
		)

		this.adminsRole = new Role(this, 'AdminsRole', {
			assumedBy: identityPoolPrincipal,
		})

		this.userPool.addGroup('admins', {
			groupName: 'admins',
			description: 'Admins',
			precedence: 0,
			role: this.adminsRole,
		})

		const authenticatedUserRole = new Role(this, 'authenticatedUserRole', {
			assumedBy: identityPoolPrincipal,
		})

		const unauthenticatedUserRole = new Role(this, 'unauthenticatedUserRole', {
			assumedBy: identityPoolPrincipal,
		})

		new CfnIdentityPoolRoleAttachment(this, 'identityPoolRoles', {
			identityPoolId: this.identityPool.ref,
			roles: {
				authenticated: authenticatedUserRole.roleArn,
				unauthenticated: unauthenticatedUserRole.roleArn,
			},
			roleMappings: {
				userPool: {
					identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`,
					type: 'Token',
					ambiguousRoleResolution: 'AuthenticatedRole',
				},
			},
		})
	}
}
