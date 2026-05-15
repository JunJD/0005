import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const SOURCE_DIR = process.env.FIG_SOURCE_DIR ?? 'assets/figma/source'
const ASSETS_DIR = process.env.FIG_ASSETS_DIR ?? 'assets/figma/assets'
const ORIGINAL_DIR = process.env.FIG_ORIGINAL_DIR ?? 'assets/figma/original'
const PUBLIC_DIR = process.env.FIG_PUBLIC_DIR ?? 'apps/web/public/figma'
const MANIFEST_PATH = process.env.FIG_MANIFEST_PATH ?? 'assets/figma/metadata/local-assets.json'

await mkdir(ASSETS_DIR, { recursive: true })
await mkdir(ORIGINAL_DIR, { recursive: true })
await mkdir(join(PUBLIC_DIR, 'assets'), { recursive: true })
await mkdir(join(PUBLIC_DIR, 'original'), { recursive: true })
await mkdir(join(SOURCE_DIR, '..', 'metadata'), { recursive: true })

const sourceImagesDir = join(SOURCE_DIR, 'images')
const files = (await readdir(sourceImagesDir)).sort()
const assets = []
const originals = []

let assetIndex = 1
let originalIndex = 1

for (const file of files) {
  const sourcePath = join(sourceImagesDir, file)
  const buffer = await readFile(sourcePath)
  const png = readPngSize(buffer)

  if (!png) {
    continue
  }

  const base = `${String(assetIndex).padStart(2, '0')}-${file.slice(0, 10)}-${png.width}x${png.height}.png`
  const assetName = `asset-${base}`
  const assetPath = join(ASSETS_DIR, assetName)
  const publicAssetPath = join(PUBLIC_DIR, 'assets', assetName)

  await copyFile(sourcePath, assetPath)
  await copyFile(sourcePath, publicAssetPath)

  const item = {
    id: file,
    filename: assetName,
    width: png.width,
    height: png.height,
    aspectRatio: Number((png.width / png.height).toFixed(4)),
    source: sourcePath,
    path: assetPath,
    publicPath: `/figma/assets/${assetName}`,
    role: classifyImage(png.width, png.height),
  }

  assets.push(item)

  if (item.role === 'screen-original') {
    const originalName = `source-screen-${String(originalIndex).padStart(2, '0')}-${file.slice(0, 10)}-${png.width}x${png.height}.png`
    const originalPath = join(ORIGINAL_DIR, originalName)
    const publicOriginalPath = join(PUBLIC_DIR, 'original', originalName)

    await copyFile(sourcePath, originalPath)
    await copyFile(sourcePath, publicOriginalPath)

    originals.push({
      ...item,
      filename: originalName,
      path: originalPath,
      publicPath: `/figma/original/${originalName}`,
    })
    originalIndex += 1
  }

  assetIndex += 1
}

try {
  await copyFile(join(SOURCE_DIR, 'thumbnail.png'), join(PUBLIC_DIR, 'thumbnail.png'))
} catch {
  // thumbnail is optional in local .fig exports
}

const manifest = {
  source: basename(SOURCE_DIR),
  importedAt: new Date().toISOString(),
  counts: {
    assets: assets.length,
    originals: originals.length,
  },
  originals,
  assets,
}

await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
await writeFile(join(PUBLIC_DIR, 'local-assets.json'), `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Imported ${assets.length} image assets.`)
console.log(`Detected ${originals.length} screen originals.`)
console.log(`Manifest: ${MANIFEST_PATH}`)

function readPngSize(buffer) {
  const signature = '89504e470d0a1a0a'

  if (buffer.subarray(0, 8).toString('hex') !== signature) {
    return null
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function classifyImage(width, height) {
  const ratio = height / width

  if (width >= 1000 && height >= 1400 && ratio >= 1.45 && ratio <= 1.9) {
    return 'screen-original'
  }

  if (width >= 1000 || height >= 1000) {
    return 'large-composite-asset'
  }

  return 'ui-asset'
}
