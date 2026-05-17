import { cp, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const webDist = resolve(appDir, '../web/dist')
const target = resolve(appDir, 'build/web')

await rm(target, { recursive: true, force: true })
await cp(webDist, target, { recursive: true })
