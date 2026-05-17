import { BrowserWindow, app, ipcMain, session, systemPreferences } from 'electron'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { networkInterfaces } from 'node:os'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packagedWebPort = 5173
const packagedServerPort = 4000
const webUrl = process.env.JINGCHU_WEB_URL ?? `http://localhost:${packagedWebPort}`
const serverUrl = process.env.JINGCHU_SERVER_URL ?? `http://localhost:${packagedServerPort}`
const startScreen = process.env.JINGCHU_ELECTRON_START_SCREEN === '1'
const startSceneDebug = process.env.JINGCHU_ELECTRON_START_SCENE
const webviewPartitions = ['bronze', 'bell', 'porcelain', 'lacquer'].map((roleId) => `persist:kivicube-${roleId}`)
const roleIds = ['bronze', 'bell', 'porcelain', 'lacquer']
const mobileUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const mobileViewport = {
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
}
const allowedPermissionOrigins = new Set(['https://www.kivicube.com', new URL(webUrl).origin])
const allowedPermissions = new Set(['media', 'fullscreen', 'speaker-selection'])
const rooms = new Map()

let mainWindow
const configuredGuestIds = new Set()

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')
app.commandLine.appendSwitch('use-fake-ui-for-media-stream')
app.commandLine.appendSwitch('touch-events', 'enabled')

app.whenReady().then(async () => {
  if (app.isPackaged && !process.env.JINGCHU_WEB_URL) await startPackagedRuntime()
  await requestSystemMediaAccess()
  installMediaPermissionHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('desktop:get-info', () => getDesktopInfo())
ipcMain.handle('desktop:open-screen', async () => {
  await openScreen()
})
ipcMain.handle('desktop:open-control', async () => {
  await openControl()
})
ipcMain.handle('desktop:open-scene-debug', async (_event, roleId) => {
  await openSceneDebug(roleIds.includes(roleId) ? roleId : roleIds[0])
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: join(__dirname, 'preload.mjs'),
      webviewTag: true,
    },
  })

  installWebviewHandlers(mainWindow.webContents)
  if (startSceneDebug || startScreen) {
    mainWindow.webContents.once('did-finish-load', () => {
      if (startSceneDebug) {
        openSceneDebug(roleIds.includes(startSceneDebug) ? startSceneDebug : roleIds[0])
        return
      }

      openScreen()
    })
  }
  mainWindow.loadFile(join(__dirname, 'launcher.html'))
}

async function openScreen() {
  await mainWindow.loadURL(`${webUrl}/screen?electronAr=1`)
}

async function openControl() {
  await mainWindow.loadURL(`${webUrl}/control`)
}

async function openSceneDebug(roleId) {
  const params = new URLSearchParams({
    electronAr: '1',
    sceneDebug: '1',
    role: roleId,
  })

  await mainWindow.loadURL(`${webUrl}/screen?${params.toString()}`)
}

function getDesktopInfo() {
  const lanUrl = getLanWebUrl()

  return {
    controlUrl: `${lanUrl}/control`,
    screenUrl: `${lanUrl}/screen`,
    serverUrl,
    webUrl,
  }
}

function getLanWebUrl() {
  const url = new URL(webUrl)
  const port = url.port ? `:${url.port}` : ''
  const ip = getLanAddress()
  return `${url.protocol}//${ip}${port}`
}

function getLanAddress() {
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) return address.address
    }
  }

  return 'localhost'
}

function installMediaPermissionHandlers() {
  const sessions = [session.defaultSession, ...webviewPartitions.map((partition) => session.fromPartition(partition))]

  for (const item of sessions) {
    item.setPermissionRequestHandler((_webContents, permission, callback, details) => {
      callback(allowedPermissions.has(permission) && isAllowedPermissionOrigin(getPermissionOrigin(details)))
    })
    item.setPermissionCheckHandler((_webContents, permission, requestingOrigin) => {
      return allowedPermissions.has(permission) && isAllowedPermissionOrigin(requestingOrigin)
    })
    item.webRequest.onBeforeSendHeaders({ urls: ['https://www.kivicube.com/*'] }, (details, callback) => {
      details.requestHeaders['User-Agent'] = mobileUserAgent
      details.requestHeaders['Sec-CH-UA-Mobile'] = '?1'
      details.requestHeaders['Sec-CH-UA-Platform'] = '"iOS"'
      callback({ requestHeaders: details.requestHeaders })
    })
  }
}

async function requestSystemMediaAccess() {
  if (process.platform !== 'darwin') return

  for (const mediaType of ['camera', 'microphone']) {
    const status = systemPreferences.getMediaAccessStatus(mediaType)
    if (status === 'not-determined') {
      const granted = await systemPreferences.askForMediaAccess(mediaType)
      if (!granted) console.warn(`[desktop] ${mediaType} access was denied`)
      continue
    }

    if (status !== 'granted') console.warn(`[desktop] ${mediaType} access status: ${status}`)
  }
}

function getPermissionOrigin(details) {
  return details?.securityOrigin ?? details?.requestingUrl ?? ''
}

function isAllowedPermissionOrigin(origin) {
  if (!origin) return false

  try {
    const url = new URL(origin)
    return allowedPermissionOrigins.has(url.origin)
  } catch {
    return false
  }
}

function installWebviewHandlers(hostWebContents) {
  hostWebContents.on('will-attach-webview', (_event, webPreferences, params) => {
    webPreferences.nodeIntegration = false
    webPreferences.contextIsolation = true
    params.useragent = mobileUserAgent
  })

  hostWebContents.on('did-attach-webview', (_event, guestWebContents) => {
    configureMobileGuest(guestWebContents)
  })
}

async function configureMobileGuest(guestWebContents) {
  if (configuredGuestIds.has(guestWebContents.id)) return
  configuredGuestIds.add(guestWebContents.id)

  guestWebContents.setUserAgent(mobileUserAgent)
  guestWebContents.enableDeviceEmulation({
    deviceScaleFactor: mobileViewport.deviceScaleFactor,
    screenPosition: 'mobile',
    screenSize: { width: mobileViewport.width, height: mobileViewport.height },
    viewPosition: { x: 0, y: 0 },
    viewSize: { width: mobileViewport.width, height: mobileViewport.height },
    scale: 1,
  })

  try {
    guestWebContents.debugger.attach('1.3')
    await guestWebContents.debugger.sendCommand('Emulation.setUserAgentOverride', {
      userAgent: mobileUserAgent,
      platform: 'iPhone',
      userAgentMetadata: {
        brands: [
          { brand: 'Not A(Brand', version: '99' },
          { brand: 'Mobile Safari', version: '17' },
        ],
        fullVersionList: [
          { brand: 'Not A(Brand', version: '99.0.0.0' },
          { brand: 'Mobile Safari', version: '17.5.0.0' },
        ],
        platform: 'iOS',
        platformVersion: '17.5.0',
        architecture: '',
        model: 'iPhone',
        mobile: true,
      },
    })
    await guestWebContents.debugger.sendCommand('Emulation.setDeviceMetricsOverride', {
      width: mobileViewport.width,
      height: mobileViewport.height,
      deviceScaleFactor: mobileViewport.deviceScaleFactor,
      mobile: true,
      screenWidth: mobileViewport.width,
      screenHeight: mobileViewport.height,
      screenOrientation: { type: 'portraitPrimary', angle: 0 },
    })
    await guestWebContents.debugger.sendCommand('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5,
    })
  } catch (error) {
    console.warn('[desktop] mobile emulation setup failed', error)
  }

  setTimeout(() => {
    if (!guestWebContents.isDestroyed()) guestWebContents.reloadIgnoringCache()
  }, 100)

  guestWebContents.on('did-finish-load', () => {
    logGuestSnapshot(guestWebContents)
  })
}

async function logGuestSnapshot(guestWebContents) {
  try {
    const snapshot = await guestWebContents.executeJavaScript(`JSON.stringify({
      url: location.href,
      userAgent: navigator.userAgent,
      width: innerWidth,
      height: innerHeight,
      maxTouchPoints: navigator.maxTouchPoints,
      text: document.body.innerText.slice(0, 180)
    })`)
    console.log('[desktop] kivicube webview', snapshot)
  } catch (error) {
    console.warn('[desktop] failed to inspect webview', error)
  }
}

async function startPackagedRuntime() {
  const { Server } = await import('socket.io')
  startStaticServer(join(process.resourcesPath, 'web'), packagedWebPort)
  startSocketServer(packagedServerPort, Server)
}

function startStaticServer(root, port) {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', `http://localhost:${port}`)
    const filePath = getStaticFilePath(root, url.pathname)

    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', getContentType(filePath))
    createReadStream(filePath).pipe(response)
  })

  server.listen(port, '0.0.0.0')
}

function getStaticFilePath(root, pathname) {
  const safePath = decodeURIComponent(pathname).replace(/^\/+/, '')
  const candidate = join(root, safePath)

  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  return join(root, 'index.html')
}

function getContentType(filePath) {
  const extension = extname(filePath)
  if (extension === '.html') return 'text/html; charset=utf-8'
  if (extension === '.js') return 'text/javascript; charset=utf-8'
  if (extension === '.css') return 'text/css; charset=utf-8'
  if (extension === '.svg') return 'image/svg+xml'
  if (extension === '.png') return 'image/png'
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

function startSocketServer(port, SocketServer) {
  const httpServer = createServer((request, response) => {
    if (request.url === '/health') {
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({ ok: true, rooms: rooms.size }))
      return
    }

    response.statusCode = 404
    response.end()
  })
  const io = new SocketServer(httpServer, { cors: { origin: '*' } })

  io.on('connection', (socket) => {
    socket.on('room:join', ({ roomId }) => {
      const state = ensureRoom(roomId)
      socket.join(roomId)
      socket.emit('room:state', state)
    })

    socket.on('control:select-role', ({ roomId, roleId }) => {
      updateRoom(io, roomId, { selectedRoleId: roleId, countdown: 0 })
    })

    socket.on('control:start-preview', ({ roomId }) => {
      updateRoom(io, roomId, { stage: 'preview', countdown: 0 })
    })

    socket.on('control:start-countdown', ({ roomId }) => {
      startCountdown(io, roomId)
    })

    socket.on('control:capture-complete', ({ roomId, photoUrl }) => {
      updateRoom(io, roomId, { stage: 'captured', countdown: 0, photoUrl })
    })

    socket.on('control:reset', ({ roomId }) => {
      const previous = ensureRoom(roomId)
      setRoom(io, {
        roomId,
        stage: 'idle',
        selectedRoleId: previous.selectedRoleId,
        countdown: 0,
        updatedAt: Date.now(),
      })
    })
  })

  httpServer.listen(port, '0.0.0.0')
}

function ensureRoom(roomId) {
  const existing = rooms.get(roomId)
  if (existing) return existing

  const state = {
    roomId,
    stage: 'idle',
    selectedRoleId: 'bronze',
    countdown: 0,
    updatedAt: Date.now(),
  }
  rooms.set(roomId, state)
  return state
}

function updateRoom(io, roomId, patch) {
  const state = ensureRoom(roomId)
  setRoom(io, { ...state, ...patch, updatedAt: Date.now() })
}

function setRoom(io, state) {
  rooms.set(state.roomId, state)
  io.to(state.roomId).emit('room:state', state)
}

function startCountdown(io, roomId) {
  const initial = ensureRoom(roomId)
  setRoom(io, { ...initial, stage: 'countdown', countdown: 5, updatedAt: Date.now() })

  let next = 4
  const timer = setInterval(() => {
    const current = ensureRoom(roomId)
    if (current.stage !== 'countdown') {
      clearInterval(timer)
      return
    }

    if (next <= 0) {
      clearInterval(timer)
      updateRoom(io, roomId, { stage: 'captured', countdown: 0 })
      return
    }

    updateRoom(io, roomId, { countdown: next })
    next -= 1
  }, 1000)
}
