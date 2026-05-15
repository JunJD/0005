import cors from '@fastify/cors'
import Fastify from 'fastify'
import { Server } from 'socket.io'

type Stage = 'idle' | 'preview' | 'countdown' | 'captured' | 'error'

type RoomState = {
  roomId: string
  stage: Stage
  selectedRoleId: string
  countdown: number
  photoUrl?: string
  updatedAt: number
}

const PORT = Number(process.env.PORT ?? 4000)
const HOST = process.env.HOST ?? '0.0.0.0'
const rooms = new Map<string, RoomState>()

const server = Fastify({ logger: true })
await server.register(cors, { origin: true })

server.get('/health', async () => ({
  ok: true,
  rooms: rooms.size,
}))

const io = new Server(server.server, {
  cors: { origin: '*' },
})

io.on('connection', (socket) => {
  socket.on('room:join', ({ roomId }: { roomId: string; clientType: 'screen' | 'control' }) => {
    const state = ensureRoom(roomId)
    socket.join(roomId)
    socket.emit('room:state', state)
  })

  socket.on('control:select-role', ({ roomId, roleId }: { roomId: string; roleId: string }) => {
    updateRoom(roomId, { selectedRoleId: roleId, stage: 'preview', countdown: 0 })
  })

  socket.on('control:start-preview', ({ roomId }: { roomId: string }) => {
    updateRoom(roomId, { stage: 'preview', countdown: 0 })
  })

  socket.on('control:start-countdown', ({ roomId }: { roomId: string }) => {
    startCountdown(roomId)
  })

  socket.on('control:capture-complete', ({ roomId, photoUrl }: { roomId: string; photoUrl?: string }) => {
    updateRoom(roomId, { stage: 'captured', countdown: 0, photoUrl })
  })

  socket.on('control:reset', ({ roomId }: { roomId: string }) => {
    const previous = ensureRoom(roomId)
    setRoom({
      roomId,
      stage: 'idle',
      selectedRoleId: previous.selectedRoleId,
      countdown: 0,
      updatedAt: Date.now(),
    })
  })
})

await server.listen({ port: PORT, host: HOST })

function ensureRoom(roomId: string) {
  const existing = rooms.get(roomId)
  if (existing) {
    return existing
  }

  const state: RoomState = {
    roomId,
    stage: 'idle',
    selectedRoleId: 'phoenix',
    countdown: 0,
    updatedAt: Date.now(),
  }
  rooms.set(roomId, state)
  return state
}

function updateRoom(roomId: string, patch: Partial<Omit<RoomState, 'roomId' | 'updatedAt'>>) {
  const state = ensureRoom(roomId)
  setRoom({ ...state, ...patch, updatedAt: Date.now() })
}

function setRoom(state: RoomState) {
  rooms.set(state.roomId, state)
  io.to(state.roomId).emit('room:state', state)
}

function startCountdown(roomId: string) {
  const initial = ensureRoom(roomId)
  setRoom({ ...initial, stage: 'countdown', countdown: 5, updatedAt: Date.now() })

  let next = 4
  const timer = setInterval(() => {
    const current = ensureRoom(roomId)
    if (current.stage !== 'countdown') {
      clearInterval(timer)
      return
    }

    if (next <= 0) {
      clearInterval(timer)
      updateRoom(roomId, { stage: 'captured', countdown: 0 })
      return
    }

    updateRoom(roomId, { countdown: next })
    next -= 1
  }, 1000)
}
