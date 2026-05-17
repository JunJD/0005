import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import electronPath from 'electron'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(appDir, '../..')
const serverUrl = process.env.JINGCHU_SERVER_URL ?? 'http://localhost:4000'
const webUrl = process.env.JINGCHU_WEB_URL ?? 'http://localhost:5173'
const children = []

process.on('SIGINT', () => shutdownAndExit(130))
process.on('SIGTERM', () => shutdownAndExit(143))
process.on('exit', () => {
  for (const child of children) child.kill()
})

if (!(await isReachable(`${serverUrl}/health`))) {
  children.push(spawnLogged('server', 'pnpm', ['--filter', '@jingchu/server', 'dev'], repoRoot))
}

if (!(await isReachable(`${webUrl}/screen`))) {
  children.push(spawnLogged('web', 'pnpm', ['--filter', '@jingchu/web', 'dev'], repoRoot))
}

await waitFor(`${serverUrl}/health`, 30000)
await waitFor(`${webUrl}/screen`, 30000)

const electron = spawn(electronPath, ['src/main.mjs'], {
  cwd: appDir,
  env: {
    ...process.env,
    JINGCHU_SERVER_URL: serverUrl,
    JINGCHU_WEB_URL: webUrl,
  },
  stdio: 'inherit',
})

children.push(electron)
electron.on('exit', (code, signal) => {
  shutdown()
  if (signal) {
    console.error(`Electron exited with signal ${signal}`)
    process.exit(1)
  }
  process.exit(code ?? 0)
})

function spawnLogged(name, command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.on('data', (chunk) => process.stdout.write(prefixLines(name, chunk)))
  child.stderr.on('data', (chunk) => process.stderr.write(prefixLines(name, chunk)))
  return child
}

function prefixLines(name, chunk) {
  return String(chunk)
    .split('\n')
    .map((line, index, lines) => (line || index < lines.length - 1 ? `[${name}] ${line}` : line))
    .join('\n')
}

async function waitFor(url, timeoutMs) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (await isReachable(url)) return
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 400))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function isReachable(url) {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
}

function shutdownAndExit(code) {
  shutdown()
  process.exit(code)
}
