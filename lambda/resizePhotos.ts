import { PhotoSize } from '#domain/PhotoSize.ts'
import type { ULID } from '#event/AggregateEvent.ts'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { fromEnv } from '@bifravst/from-env'
import middy from '@middy/core'
import inputOutputLogger from '@middy/input-output-logger'
import type { S3Event } from 'aws-lambda'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path, { parse } from 'node:path'
import { addSizedPhotoCommand } from '../command/addSizedPhotoCommand.ts'
import { findReportByIdDynamoDB } from '../persistence/dynamoDB/findReportByIdDynamoDB.ts'
import { persistReportDynamoDB } from '../persistence/dynamoDB/persistReportDynamoDB.ts'

const s3 = new S3Client({})
const db = new DynamoDBClient({})

const { resizedBucketName, reportAggregatesTableName, eventsTableName } =
	fromEnv({
		version: 'VERSION',
		resizedBucketName: 'RESIZED_BUCKET_NAME',
		reportAggregatesTableName: 'REPORT_AGGREGATES_TABLE_NAME',
		eventsTableName: 'EVENTS_TABLE_NAME',
	})(process.env)

const persist = persistReportDynamoDB(
	db,
	reportAggregatesTableName,
	eventsTableName,
)

const find = findReportByIdDynamoDB(db, reportAggregatesTableName)

const update = addSizedPhotoCommand(find, persist)

export const handler = middy<S3Event>()
	.use(inputOutputLogger())
	.handler(async (event) => {
		for (const record of event.Records) {
			const original = await fetchOriginal(
				record.s3.bucket.name,
				record.s3.object.key,
			)
			if (original === null) throw new Error(`Failed to fetch original image!`)
			const originalFile = path.join(os.tmpdir(), randomUUID())
			await writeFile(originalFile, original.body, 'binary')

			const originalInfo = (
				await run('/opt/bin/identify', [originalFile])
			).toString('ascii')
			console.log(`Original image info: ${originalInfo}`)
			const [, type, dimensions] = originalInfo.split(' ') // /tmp/f5bb4094-29eb-44ff-9c29-feaf5d2ce7d4 JPEG 3008x4000 3008x4000+0+0 8-bit sRGB 2.49426MiB 0.010u 0:00.004

			if (type !== 'JPEG') throw new Error(`Unsupported image type: ${type}`)

			const [w, h] = (dimensions ?? '0x0').split('x').map(Number)
			const width = w ?? 0
			const height = h ?? 0
			if (width < 500 || height < 500) {
				throw new Error(
					`Image dimensions too small: ${dimensions} (must be at least 500x500)`,
				)
			}
			const isPortrait = height > width

			// Placeholder
			const placeHolderFile = `${path.join(os.tmpdir(), randomUUID())}.webp`
			const thumbFile = `${path.join(os.tmpdir(), randomUUID())}.webp`
			const scaledFile = `${path.join(os.tmpdir(), randomUUID())}.webp`

			// Resize original image
			await Promise.all([
				run('/opt/bin/convert', [
					originalFile,
					'-thumbnail',
					`16x16^`,
					`-gravity`,
					`center`,
					`-crop`,
					`16x16+0+0`,
					'-quality',
					`20`,
					`-strip`,
					placeHolderFile,
				]),
				run('/opt/bin/convert', [
					originalFile,
					'-thumbnail',
					`256x256^`,
					`-gravity`,
					`center`,
					`-crop`,
					`256x256+0+0`,
					'-quality',
					`60`,
					`-strip`,
					thumbFile,
				]),
				run('/opt/bin/convert', [
					originalFile,
					'-resize',
					isPortrait ? `x2000` : `2000x`,
					'-quality',
					`85`,
					scaledFile,
				]),
			])

			// Upload to S3
			const [placeholderURL, thumbnailURL, scaledURL] = await Promise.all([
				uploadScaled(record.s3, PhotoSize.placeholder, placeHolderFile),
				uploadScaled(record.s3, PhotoSize.thumbnail, thumbFile),
				uploadScaled(record.s3, PhotoSize.scaled, scaledFile),
			])

			const orig = parse(record.s3.object.key)

			const updated = await update(
				original.reportId,
				`${orig.name}${orig.ext}`,
				{
					placeholder: placeholderURL.toString(),
					thumbnail: thumbnailURL.toString(),
					scaled: scaledURL.toString(),
				},
				'resize-photos-lambda',
			)

			console.log(JSON.stringify(updated, null, 2))

			// Delete local files
			void rm(originalFile)
			void rm(placeHolderFile)
			void rm(thumbFile)
			void rm(scaledFile)
		}
	})

const cacheForAYear = 'public, max-age=31449600, immutable'

const fetchOriginal = async (
	Bucket: string,
	Key: string,
): Promise<{ body: Buffer; reportId: ULID } | null> => {
	// Try to fetch original
	try {
		const { Body, Metadata } = await s3.send(
			new GetObjectCommand({
				Bucket,
				Key,
			}),
		)
		if (Body === undefined) return null
		if (Metadata?.reportid === undefined)
			throw new Error('Missing reportId in metadata')
		const stream = await Body.transformToByteArray()
		return {
			body: Buffer.from(stream),
			reportId: Metadata.reportid as ULID,
		}
	} catch (err) {
		console.error(err)
		return null
	}
}

const run = async (cmd: string, args: string[]): Promise<Buffer> =>
	new Promise<Buffer>((resolve, reject) => {
		const proc = spawn(cmd, args)
		const resultBuffers: Buffer[] = []
		const errorBuffers: Buffer[] = []
		proc.stdout.on('data', (buffer) => {
			resultBuffers.push(buffer)
		})
		proc.stderr.on('data', (buffer) => errorBuffers.push(buffer))
		proc.on('exit', (code, signal) => {
			if (code !== 0) {
				reject(
					new Error(
						`failed with ${code ?? signal}: ${Buffer.concat(errorBuffers).toString()}`,
					),
				)
			} else {
				resolve(Buffer.concat(resultBuffers))
			}
		})
	})

const uploadScaled = async (
	original: S3Event['Records'][number]['s3'],
	size: PhotoSize,
	scaledFilePath: string,
): Promise<URL> => {
	const orig = parse(original.object.key)
	const Key = `${orig.dir}/${orig.name}.${size}.webp`
	await s3.send(
		new PutObjectCommand({
			Bucket: resizedBucketName,
			Key,
			Body: createReadStream(scaledFilePath),
			ContentType: `image/webp`,
			CacheControl: cacheForAYear,
		}),
	)
	console.log(
		`Uploaded ${size} image ${scaledFilePath} to s3://${resizedBucketName}/${Key}`,
	)
	return new URL(
		`https://${resizedBucketName}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${Key}`,
	)
}
