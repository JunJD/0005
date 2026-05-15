import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY ?? 'UV8uITtoJnJbeTDgFcmFJ8'
const FIGMA_TOKEN = process.env.FIGMA_TOKEN
const OUT_DIR = process.env.FIGMA_OUT_DIR ?? 'assets/figma'
const REQUEST_TIMEOUT_MS = Number(process.env.FIGMA_TIMEOUT_MS ?? 30000)
const FIGMA_DEPTH = process.env.FIGMA_DEPTH ?? '2'
const FIGMA_SCALE = process.env.FIGMA_SCALE ?? '0.25'
const FIGMA_BATCH_SIZE = Number(process.env.FIGMA_BATCH_SIZE ?? 1)
const FIGMA_USE_EXISTING_METADATA = process.env.FIGMA_USE_EXISTING_METADATA === '1'

if (!FIGMA_TOKEN) {
  console.error('Set FIGMA_TOKEN before running this script.')
  process.exit(1)
}

await mkdir(join(OUT_DIR, 'metadata'), { recursive: true })
await mkdir(join(OUT_DIR, 'exports'), { recursive: true })

const metadataPath = join(OUT_DIR, 'metadata', 'file.json')
const file = FIGMA_USE_EXISTING_METADATA && (await exists(metadataPath))
  ? JSON.parse(await readFile(metadataPath, 'utf8'))
  : await fetchFileMetadata()

const frames = collectFrames(file.document)
await writeFile(join(OUT_DIR, 'metadata', 'frames.json'), JSON.stringify(frames, null, 2))
console.log(`Found ${frames.length} top-level frames.`)

if (frames.length === 0) {
  console.log('No top-level frames found.')
  process.exit(0)
}

for (let index = 0; index < frames.length; index += FIGMA_BATCH_SIZE) {
  const batch = frames.slice(index, index + FIGMA_BATCH_SIZE)
  const pending = []

  for (const frame of batch) {
    const filename = `${safeName(frame.name)}-${frame.id.replaceAll(':', '_')}.png`
    const targetPath = join(OUT_DIR, 'exports', filename)

    if (await exists(targetPath)) {
      console.log(`Skipping existing ${filename}`)
      continue
    }

    pending.push({ frame, filename, targetPath })
  }

  if (pending.length === 0) {
    continue
  }

  const ids = pending.map(({ frame }) => frame.id).join(',')
  console.log(`Requesting image export URLs ${index + 1}-${index + batch.length} at scale ${FIGMA_SCALE}...`)
  const images = await figmaFetch(`/v1/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=${encodeURIComponent(FIGMA_SCALE)}`)

  for (const { frame, filename, targetPath } of pending) {
    const url = images.images?.[frame.id]
    if (!url) {
      console.warn(`No export URL for ${frame.name} (${frame.id})`)
      continue
    }

    try {
      console.log(`Downloading ${frame.name}...`)
      const response = await fetchWithTimeout(url)
      if (!response.ok) {
        throw new Error(`Failed to download ${frame.name}: ${response.status}`)
      }

      await writeFile(targetPath, Buffer.from(await response.arrayBuffer()))
      console.log(`Exported ${filename}`)
    } catch (error) {
      console.warn(`Skipped ${frame.name}: ${error.message}`)
    }
  }
}

async function figmaFetch(path) {
  let response = await fetchWithTimeout(`https://api.figma.com${path}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  })

  if (response.status === 429) {
    const retryAfterSeconds = Math.min(Number(response.headers.get('retry-after') ?? 60), 60)
    console.warn(`Figma rate limit hit. Waiting ${retryAfterSeconds}s...`)
    await sleep(retryAfterSeconds * 1000)
    response = await fetchWithTimeout(`https://api.figma.com${path}`, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
    })
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Figma API failed ${response.status}: ${body}`)
  }

  return response.json()
}

async function fetchFileMetadata() {
  console.log(`Fetching Figma file ${FIGMA_FILE_KEY} at depth ${FIGMA_DEPTH}...`)
  const file = await figmaFetch(`/v1/files/${FIGMA_FILE_KEY}?depth=${encodeURIComponent(FIGMA_DEPTH)}`)
  await writeFile(metadataPath, JSON.stringify(file, null, 2))
  return file
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function collectFrames(node, pageName = '') {
  if (!node?.children) {
    return []
  }

  if (node.type === 'CANVAS') {
    return node.children
      .filter((child) => child.type === 'FRAME')
      .map((child) => ({
        id: child.id,
        name: `${node.name}-${child.name}`,
        pageName: node.name,
        width: child.absoluteBoundingBox?.width,
        height: child.absoluteBoundingBox?.height,
      }))
  }

  return node.children.flatMap((child) => collectFrames(child, pageName || node.name))
}

function safeName(value) {
  return basename(value)
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
