import { randomUUID } from 'node:crypto'

export const testActor = (): string => `test-actor:${randomUUID()}`
