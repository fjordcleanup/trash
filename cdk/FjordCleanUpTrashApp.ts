import { App, type Environment } from 'aws-cdk-lib'
import { AccountCustomDomainCertificateStack } from './AccountCustomDomainCertificateStack.ts'
import { AccountStack } from './AccountStack.ts'
import { AppCustomDomainCertificateStack } from './AppCustomDomainCertificateStack.ts'
import { CDStack } from './CDStack.ts'
import { HostingStack } from './HostingStack.ts'

export class FjordCleanUpTrashApp extends App {
	public constructor(
		props: ConstructorParameters<typeof HostingStack>[1] &
			ConstructorParameters<typeof CDStack>[1] & { env: Environment },
	) {
		super()

		const domain = new AppCustomDomainCertificateStack(this, {
			baseDomainName: props.baseDomainName,
			env: props.env,
		})

		const hosting = new HostingStack(this, props)
		hosting.addDependency(domain)

		const accountDomain = new AccountCustomDomainCertificateStack(this, {
			baseDomainName: props.baseDomainName,
			env: props.env,
		})

		const account = new AccountStack(this, {
			baseDomainName: props.baseDomainName,
			env: props.env,
		})
		account.addDependency(accountDomain)

		new CDStack(this, props)
	}
}
