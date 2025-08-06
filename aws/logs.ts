import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import {
	CloudWatchLogsClient,
	GetQueryResultsCommand,
	StartQueryCommand,
	type ResultField,
} from '@aws-sdk/client-cloudwatch-logs'
import { listStackResources } from '@bifravst/cloudformation-helpers'
import chalk from 'chalk'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import {
	NOTIFICATIONS_STACK_NAME,
	PERSISTENCE_STACK_NAME,
	PUBLIC_API_STACK_NAME,
} from '../cdk/stacks/stackName.ts'
import { removeLeadingTimestamp } from './removeLeadingTimestamp.ts'

const cf = new CloudFormationClient({})

const logGroupNames = (
	await Promise.all(
		[
			PERSISTENCE_STACK_NAME,
			PUBLIC_API_STACK_NAME,
			NOTIFICATIONS_STACK_NAME,
		].map(async (stackName) => {
			const resources = await listStackResources(cf, stackName, [
				'AWS::Logs::LogGroup',
				'Custom::LogRetention',
			])
			return resources.map((resource) => resource.PhysicalResourceId)
		}),
	)
).flat()
const cloudWatchLogs = new CloudWatchLogsClient({})

//const queryString = queryDefinition.queryString
const queryString = [
	'fields @timestamp, @message, @log',
	'| sort @timestamp asc',
	'| sort @log asc',
].join('\n')

console.error(chalk.gray('Querying logs with query definition:'))
console.error(chalk.magenta(queryString))
console.error()
console.error(chalk.gray('Log groups:'))
console.error(chalk.blue(logGroupNames.join('\n')))

const startQueryResponse = await cloudWatchLogs.send(
	new StartQueryCommand({
		logGroupNames,
		startTime: Math.floor(Date.now() / 1000) - 3600 * 6, // last hour
		endTime: Math.floor(Date.now() / 1000),
		queryString,
	}),
)

const queryId = startQueryResponse.queryId
if (queryId === undefined) {
	throw new Error('Failed to start query')
}

let queryResults
// eslint-disable-next-line no-constant-condition
while (true) {
	const getQueryResultsCommand = new GetQueryResultsCommand({ queryId })
	const getQueryResultsResponse = await cloudWatchLogs.send(
		getQueryResultsCommand,
	)

	if (getQueryResultsResponse.status === 'Complete') {
		queryResults = getQueryResultsResponse.results
		break
	}

	await new Promise((resolve) => setTimeout(resolve, 1000)) // wait for 1 second before polling again
}
console.error()
console.error('Query Results:')

const logsByGroup = new Map<string, Array<[string, string]>>()

const fieldFilter = (name: string) => (result: ResultField) =>
	result.field === name

let lastLogGroup = ''
for (const result of queryResults ?? []) {
	const ts = result.find(fieldFilter('@timestamp'))?.value ?? ''
	const message = result.find(fieldFilter('@message'))?.value ?? ''
	const log = result.find(fieldFilter('@log'))?.value ?? ''
	if (log !== lastLogGroup) {
		lastLogGroup = log
	}
	if (!logsByGroup.has(log)) {
		logsByGroup.set(log, [])
	}
	logsByGroup.get(log)?.push([ts, message])
}

try {
	await mkdir(path.join(process.cwd(), 'logs'))
} catch {
	// ignore
}

for (const [logGroup, logs] of logsByGroup) {
	console.error()
	console.error(chalk.gray(logGroup))
	console.error()
	for (const [ts, message] of logs) {
		console.error(chalk.gray(ts), removeLeadingTimestamp(message).trim())
	}
	await writeFile(
		path.join(
			process.cwd(),
			'logs',
			`${logGroup.replaceAll(/[^a-z0-9]/gi, '_')}.txt`,
		),
		logs
			.map(
				([ts, message]) => `[${ts}]\t${removeLeadingTimestamp(message).trim()}`,
			)
			.join('\n'),
	)
}
