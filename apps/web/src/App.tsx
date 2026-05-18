import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Home, QrCode, type LucideIcon } from 'lucide-react'
import { io, type Socket } from 'socket.io-client'
import './App.css'

type Stage = 'idle' | 'preview' | 'countdown' | 'captured' | 'error'

type Role = {
  id: string
  name: string
  costume: string
  artifact: string
  artifactImage: string
  artifactPeriod: string
  artifactIntro: string
  description: string
  previewImage: string
  accent: string
  cardGradient: string
  buttonGradient: string
  kivicubeSceneId: string
}

type KivicubeSceneOptions = {
  sceneId: string
  hideLogo?: boolean
  hideTitle?: boolean
  hideDownload?: boolean
  cameraPosition?: 'front' | 'back'
  hideLoading?: boolean
  hideScan?: boolean
  hideTakePhoto?: boolean
  hideBackground?: boolean
  hideStart?: boolean
  disableOpenUrl?: boolean
  trial?: boolean
}

type KivicubeIframePlugin = {
  openKivicubeScene: (
    iframe: HTMLIFrameElement,
    options: KivicubeSceneOptions,
    autoOpen?: boolean,
  ) => Promise<{ id: string; allow: string; src: string }>
}

declare global {
  interface Window {
    kivicubeIframePlugin?: KivicubeIframePlugin
  }
}

type RoomState = {
  roomId: string
  stage: Stage
  selectedRoleId: string
  countdown: number
  photoUrl?: string
  updatedAt: number
}

type ControlPage = 'home' | 'select' | 'detail' | 'iframe' | 'photo' | 'result'

const figmaImages = {
  hero: '/figma/original/source-screen-04-763851a1b0-2305x4096.png',
  ending: '/figma/original/source-screen-06-deb0143475-2304x4096.png',
  photoGroup: '/figma/original/source-screen-04-763851a1b0-2305x4096.png',
  homeBg: '/figma/assets/asset-20-7f8ad124ce-4096x3039.png',
  photoBg: '/figma/assets/asset-31-abbdc98109-4096x3039.png',
  resultPattern: '/figma/assets/asset-35-c5a50823c8-500x500.png',
  logo: '/figma/assets/asset-12-62fe3f03fc-4096x4096.png',
  bronze: '/figma/assets/asset-23-85619f9691-1558x4096.png',
  bell: '/figma/assets/asset-11-620705a2ec-1668x2591.png',
  porcelain: '/figma/assets/asset-07-2d13baece7-1668x2591.png',
  lacquer: '/figma/assets/asset-05-1b094eafee-1920x3412.png',
  bronzeArtifact: '/figma/assets/asset-30-9864a80898-1280x2054.png',
  bellArtifact: '/figma/assets/asset-36-c6f5dacfff-1080x1090.png',
  porcelainArtifact: '/figma/assets/asset-02-0618af1604-1024x1024.png',
  lacquerArtifact: '/figma/assets/asset-22-845c4f8199-1276x1340.png',
  cloud: '/figma/assets/asset-12-62fe3f03fc-4096x4096.png',
}

const roles: Role[] = [
  {
    id: 'bronze',
    name: '曾侯乙尊盘',
    costume: '青铜礼装',
    artifact: '尊盘纹样',
    artifactImage: figmaImages.bronzeArtifact,
    artifactPeriod: '战国早期（约433年-前423年）\n1978年湖北随州曾侯乙墓出土\n湖北省博物馆镇馆·国家一级文物',
    artifactIntro: '尊盘是青铜礼器，由尊和盘组成。器身饰蟠螭纹与细密纹样，造型工艺华美，代表了战国时期青铜铸造的高峰。',
    description: '楚式青铜铸造技术的巅峰之作',
    previewImage: figmaImages.bronze,
    accent: '#28b985',
    cardGradient: 'linear-gradient(180deg, #717171 0%, #244F3C 50%, #737373 100%)',
    buttonGradient:
      'linear-gradient(90deg, rgba(111, 130, 128, 0.6) 0%, rgba(207, 233, 224, 0.6) 50%, rgba(103, 119, 117, 0.6) 100%)',
    kivicubeSceneId: 'gut9oeLS4H1d1pufkR11d7TNxUg6kzHH',
  },
  {
    id: 'bell',
    name: '曾侯乙编钟',
    costume: '楚式深衣',
    artifact: '编钟纹样',
    artifactImage: figmaImages.bellArtifact,
    artifactPeriod: '战国早期（约433年-前423年）\n1978年随州曾侯乙墓出土\n湖北省博物馆镇馆·国家一级文物',
    artifactIntro: '曾侯乙编钟是中国古代礼乐文明的瑰宝，由大小65件青铜编钟组成，音域跨五个半八度，音律精准，气势恢宏。',
    description: '大型礼乐重器，音乐性能完善',
    previewImage: figmaImages.bell,
    accent: '#d9a343',
    cardGradient: 'linear-gradient(180deg, #89898A 0%, #7D6028 50%, #737373 100%)',
    buttonGradient: 'linear-gradient(90deg, #6B675B 0%, #D1CCB7 50%, #6F6B5F 100%)',
    kivicubeSceneId: '6jsme2ldg2vycBt4QkxVa8SQuEswqYIO',
  },
  {
    id: 'porcelain',
    name: '元青花四爱图梅瓶',
    costume: '青花瓷甲',
    artifact: '梅瓶纹样',
    artifactImage: figmaImages.porcelainArtifact,
    artifactPeriod: '元代（1271年-1368年）\n1972年湖北省钟祥市元代窖藏出土\n湖北省博物馆镇馆·国家一级文物',
    artifactIntro: '梅瓶小口、短颈、丰肩，青花纹饰层次丰富。器身绘人物图，寓意高洁品格与文人风雅，是元青花的代表作品之一。',
    description: '元代景德镇窑青花瓷精品',
    previewImage: figmaImages.porcelain,
    accent: '#5b8fe8',
    cardGradient: 'linear-gradient(180deg, #89898B 0%, #365F8B 50%, #737373 100%)',
    buttonGradient: 'linear-gradient(90deg, #7E88A1 0%, #CFD8E9 50%, #7E88A1 100%)',
    kivicubeSceneId: 'hsmGzmagmckaKdBuYBW9AlDDEdFriAbv',
  },
  {
    id: 'lacquer',
    name: '虎座鸟架鼓',
    costume: '漆木羽冠',
    artifact: '虎座鸟架鼓',
    artifactImage: figmaImages.lacquerArtifact,
    artifactPeriod: '战国中期（距今约2310年）\n2002年湖北枣阳九连墩出土\n湖北省博物馆馆藏·国家一级文物',
    artifactIntro: '虎座鸟架鼓是曾侯乙墓出土的珍贵乐器，以虎为座、鸟为架，造型生动华美，装饰细致，体现了楚国时期高超的漆木工艺。',
    description: '战国时期楚国漆器，造型奇特',
    previewImage: figmaImages.lacquer,
    accent: '#d8463f',
    cardGradient: 'linear-gradient(180deg, #717171 0%, #9D3E35 50%, #737373 100%)',
    buttonGradient: 'linear-gradient(90deg, #826F6F 0%, #E9CFCF 50%, #776767 100%)',
    kivicubeSceneId: 'rjP1FjcELfZHda6SiHvnE13A5mBSohCo',
  },
]

const idleArtifactItems = [
  {
    name: '曾侯乙尊盘',
    romanized: 'ZENG HOU YI ZUN PAN',
    period: '战国时期青铜器',
    description: '礼乐文化的巅峰之作',
  },
  {
    name: '曾侯乙编钟',
    romanized: 'ZENG HOU YI BIAN ZHONG',
    period: '战国时期打击乐器',
    description: '千年回响的礼乐奇迹',
  },
  {
    name: '虎座鸟架鼓',
    romanized: 'HU ZUO NIAO JIA GU',
    period: '战国时期漆木器',
    description: '楚文化中的神话乐器',
  },
  {
    name: '元青花四爱图梅瓶',
    romanized: 'YUAN QING HUA SI AI TU MEI PING',
    period: '元代青花瓷器',
    description: '青花瓷中的经典之作',
  },
]

const controlDesign = {
  width: 1668,
  height: 2502,
}

const screenDesign = {
  width: 4320,
  height: 7680,
}

const controlCards = [
  { roleId: 'bronze', left: 245, top: 421, imageClass: 'bronze' },
  { roleId: 'lacquer', left: 838, top: 421, imageClass: 'lacquer' },
  { roleId: 'bell', left: 245, top: 1209, imageClass: 'bell' },
  { roleId: 'porcelain', left: 838, top: 1259, imageClass: 'porcelain' },
]

const defaultState: RoomState = {
  roomId: 'main',
  stage: 'idle',
  selectedRoleId: roles[0].id,
  countdown: 0,
  updatedAt: Date.now(),
}

function useRoomSocket(clientType: 'screen' | 'control') {
  const [connected, setConnected] = useState(false)
  const [state, setState] = useState<RoomState>(defaultState)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const nextSocket = io(import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000', {
      transports: ['websocket'],
    })
    socketRef.current = nextSocket

    nextSocket.on('connect', () => {
      setConnected(true)
      nextSocket.emit('room:join', { roomId: 'main', clientType })
    })

    nextSocket.on('disconnect', () => setConnected(false))
    nextSocket.on('room:state', (nextState: RoomState) => setState(nextState))

    return () => {
      socketRef.current = null
      nextSocket.close()
    }
  }, [clientType])

  const emit = useCallback((event: string, payload?: unknown) => {
    socketRef.current?.emit(event, payload)
  }, [])

  return { connected, emit, state }
}

function getSelectedRole(state: RoomState) {
  return roles.find((role) => role.id === state.selectedRoleId) ?? roles[0]
}

function getInitialControlPage(): ControlPage {
  const page = new URLSearchParams(window.location.search).get('page')
  if (page === 'select' || page === 'detail' || page === 'iframe' || page === 'photo' || page === 'result') {
    return page
  }

  if (page === 'ar') {
    return 'iframe'
  }

  return page === 'end' || page === 'ending' || page === 'captured' ? 'result' : 'home'
}

function getInitialDetailRoleId() {
  const roleId = new URLSearchParams(window.location.search).get('role')
  return roles.some((role) => role.id === roleId) ? roleId! : defaultState.selectedRoleId
}

function getScreenState(socketState: RoomState): RoomState {
  const params = new URLSearchParams(window.location.search)
  const stageParam = params.get('stage') ?? params.get('page') ?? params.get('state')
  const stage = getScreenStage(stageParam)
  const roleId = params.get('role')

  if (!stage) {
    return roles.some((role) => role.id === roleId) ? { ...socketState, selectedRoleId: roleId! } : socketState
  }

  const countdownParam = params.get('countdown')
  const queryCountdown = countdownParam === null ? NaN : Number(countdownParam)
  const fallbackCountdown = socketState.countdown > 0 ? socketState.countdown : 5
  const countdown = Number.isFinite(queryCountdown) && queryCountdown > 0 ? queryCountdown : fallbackCountdown

  return {
    ...socketState,
    stage,
    selectedRoleId: roles.some((role) => role.id === roleId) ? roleId! : socketState.selectedRoleId,
    countdown: stage === 'countdown' ? countdown : socketState.countdown,
  }
}

function getScreenStage(stage: string | null): Stage | null {
  if (stage === 'idle' || stage === 'preview' || stage === 'countdown' || stage === 'captured' || stage === 'error') {
    return stage
  }

  if (stage === 'tryon' || stage === 'ar') {
    return 'preview'
  }

  if (stage === 'timer') {
    return 'countdown'
  }

  if (stage === 'sent' || stage === 'photo-sent') {
    return 'captured'
  }

  return null
}

function useDesignRem(width: number, height: number) {
  useEffect(() => {
    const root = document.documentElement
    const previousFontSize = root.style.fontSize
    const resize = () => {
      const scale = Math.min(window.innerWidth / width, window.innerHeight / height)
      root.style.fontSize = `${scale}px`
    }

    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      root.style.fontSize = previousFontSize
    }
  }, [height, width])
}

function App() {
  const route = window.location.pathname

  if (route.startsWith('/screen')) {
    return <ScreenApp />
  }

  return <ControlApp />
}

function ScreenApp() {
  const { state: socketState } = useRoomSocket('screen')
  const state = getScreenState(socketState)
  const selectedRole = getSelectedRole(state)
  const showKivicubeScene = state.stage === 'countdown'
  const showBackground = state.stage !== 'countdown'
  const screenBackground = state.stage === 'captured' ? figmaImages.ending : figmaImages.hero
  useDesignRem(screenDesign.width, screenDesign.height)

  return (
    <main className="screen-shell">
      <section className={`screen-frame screen-frame-${state.stage}`}>
        {showBackground && <img className="screen-bg" src={screenBackground} alt="" />}

        {state.stage === 'idle' && <ScreenIdleOverlay />}
        {state.stage === 'captured' && <ScreenCapturedOverlay />}

        <ScreenKivicubeStage activeRoleId={selectedRole.id} countdown={state.countdown} showCountdown={state.stage === 'countdown'} visible={showKivicubeScene} />

        {state.stage === 'error' && (
          <div className="screen-result error">
            <h2>连接异常</h2>
            <p>请检查本地服务和 Kivicube 链接</p>
          </div>
        )}
      </section>
    </main>
  )
}

function ScreenKivicubeStage({
  activeRoleId,
  countdown,
  showCountdown,
  visible,
}: {
  activeRoleId: string
  countdown: number
  showCountdown: boolean
  visible: boolean
}) {
  const frameRefs = useRef<Record<string, HTMLIFrameElement | null>>({})
  const loadedSceneIds = useRef(new Set<string>())

  useEffect(() => {
    const plugin = window.kivicubeIframePlugin
    if (!plugin) return

    roles.forEach((role) => {
      const iframe = frameRefs.current[role.id]
      if (!iframe) return
      if (loadedSceneIds.current.has(role.kivicubeSceneId)) return

      loadedSceneIds.current.add(role.kivicubeSceneId)
      void plugin.openKivicubeScene(iframe, {
        sceneId: role.kivicubeSceneId,
        hideLogo: true,
        hideTitle: true,
        hideDownload: true,
        cameraPosition: 'front',
        hideLoading: true,
        hideScan: true,
        hideTakePhoto: false,
        hideBackground: true,
        hideStart: true,
        disableOpenUrl: true,
        trial: true,
      })
    })
  }, [])

  return (
    <div className={visible ? 'screen-stage screen-stage-visible' : 'screen-stage'} aria-hidden={!visible}>
      <div className="screen-stage-shell">
        {roles.map((role) => (
          <iframe
            allow="camera; microphone; gyroscope; accelerometer; magnetometer; fullscreen; clipboard-write"
            allowFullScreen
            className={visible && role.id === activeRoleId ? 'screen-stage-frame screen-stage-frame-active' : 'screen-stage-frame'}
            key={role.id}
            ref={(element) => {
              frameRefs.current[role.id] = element
            }}
            title={`${role.name} Kivicube Body AR`}
          />
        ))}
        {showCountdown && (
          <div className="screen-countdown" aria-hidden="true">
            <div className="screen-countdown-ring" />
            <div className="screen-countdown-number">{countdown}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function ScreenCapturedOverlay() {
  return (
    <div className="screen-captured-layer">
      <img className="screen-captured-logo" src={figmaImages.logo} alt="" />
      <div className="screen-captured-title">照片已发送至操作台</div>
      <div className="screen-captured-subtitle">PHOTO SENT TO CONSOLE</div>
      <div className="screen-captured-corner screen-captured-corner-tl">
        <i />
      </div>
      <div className="screen-captured-corner screen-captured-corner-tr">
        <i />
      </div>
      <div className="screen-captured-corner screen-captured-corner-bl">
        <i />
      </div>
      <div className="screen-captured-corner screen-captured-corner-br">
        <i />
      </div>
    </div>
  )
}

function ScreenIdleOverlay() {
  return (
    <div className="screen-idle-layer">
      <img className="screen-idle-logo" src={figmaImages.logo} alt="" />
      <div className="screen-idle-culture screen-idle-culture-left">荆• 楚• 文• 化</div>
      <div className="screen-idle-culture screen-idle-culture-right">数• 字• 重• 生</div>

      <div className="screen-idle-prompt">
        <span className="screen-idle-prompt-line" />
        <span className="screen-idle-prompt-diamond" />
        <span className="screen-idle-prompt-text">请在操作台点击开始 CLICK START ON THE CONSOLE</span>
        <span className="screen-idle-prompt-diamond" />
        <span className="screen-idle-prompt-line" />
      </div>

      <div className="screen-idle-artifacts">
        {idleArtifactItems.map((item) => (
          <article className="screen-idle-artifact" key={item.name}>
            <h2>{item.name}</h2>
            <p className="screen-idle-artifact-en">{item.romanized}</p>
            <div className="screen-idle-artifact-mark" />
            <p>{item.period}</p>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="screen-idle-footer">
        <span>湖北省博物馆AR穿戴体验</span>
        <i />
      </div>
    </div>
  )
}

function ControlApp() {
  const { emit, state } = useRoomSocket('control')
  const selectedRole = getSelectedRole(state)
  const [controlPage, setControlPage] = useState<ControlPage>(getInitialControlPage)
  const [detailRoleId, setDetailRoleId] = useState(getInitialDetailRoleId)
  const [captureArmed, setCaptureArmed] = useState(controlPage === 'result')
  const detailRole = roles.find((role) => role.id === detailRoleId) ?? selectedRole
  useDesignRem(controlDesign.width, controlDesign.height)
  const controlViewPage = controlPage === 'photo' && state.stage === 'captured' && captureArmed ? 'result' : controlPage

  const selectRole = (roleId: string) => {
    setDetailRoleId(roleId)
    emit('control:select-role', { roomId: 'main', roleId })
    setControlPage('detail')
  }

  const switchDetailRole = (offset: number) => {
    const order = controlCards.map((card) => card.roleId)
    const currentIndex = order.indexOf(detailRole.id)
    const nextRoleId = order[(currentIndex + offset + order.length) % order.length]
    setDetailRoleId(nextRoleId)
    emit('control:select-role', { roomId: 'main', roleId: nextRoleId })
  }

  return (
    <main className="control-stage">
      <section className="control-scale">
        <div className="control-canvas">
          {controlViewPage === 'home' ? (
            <ControlHome onEnter={() => setControlPage('select')} />
          ) : controlViewPage === 'select' ? (
            <ControlSelect
              onBack={() => {
                emit('control:reset', { roomId: 'main' })
                setControlPage('home')
                setCaptureArmed(false)
              }}
              onSelect={selectRole}
            />
          ) : controlViewPage === 'detail' ? (
            <ControlDetail
              onBack={() => setControlPage('select')}
              onConfirm={() => {
                emit('control:select-role', { roomId: 'main', roleId: detailRole.id })
                setControlPage('iframe')
                setCaptureArmed(false)
              }}
              onNext={() => switchDetailRole(1)}
              onPrev={() => switchDetailRole(-1)}
              role={detailRole}
            />
          ) : controlViewPage === 'iframe' ? (
            <ControlIframe onBack={() => setControlPage('detail')} role={detailRole} />
          ) : controlViewPage === 'photo' ? (
            <ControlPhoto
              countdown={state.countdown}
              onStart={() => {
                setCaptureArmed(true)
                emit('control:start-countdown', { roomId: 'main' })
              }}
            />
          ) : (
            <ControlResult
              onDone={() => {
                emit('control:reset', { roomId: 'main' })
                setControlPage('home')
                setCaptureArmed(false)
              }}
              onRetake={() => {
                setCaptureArmed(false)
                emit('control:start-preview', { roomId: 'main' })
                setControlPage('photo')
              }}
              photoUrl={state.photoUrl}
            />
          )}
        </div>
      </section>
    </main>
  )
}

function ControlHome({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="control-home">
      <img className="control-home-bg" src={figmaImages.homeBg} alt="" draggable={false} />
      <img className="control-home-logo" src={figmaImages.logo} alt="" draggable={false} />
      <button className="control-enter" onClick={onEnter} type="button">
        <span>进入幻装</span>
        <i aria-hidden="true" />
      </button>
    </section>
  )
}

function ControlSelect({ onBack, onSelect }: { onBack: () => void; onSelect: (roleId: string) => void }) {
  return (
    <section className="control-screen">
      <ControlBackButton ariaLabel="返回首页" onClick={onBack} />
      <img className="control-logo" src={figmaImages.logo} alt="" draggable={false} />
      <h1 className="control-title">选择你的荆楚守护者</h1>
      {controlCards.map((card) => {
        const role = roles.find((item) => item.id === card.roleId)!
        return <GuardianCard card={card} key={role.id} onSelect={() => onSelect(role.id)} role={role} />
      })}
      <ControlTimeline activeIndex={0} />
    </section>
  )
}

function ControlDetail({
  onBack,
  onConfirm,
  onNext,
  onPrev,
  role,
}: {
  onBack: () => void
  onConfirm: () => void
  onNext: () => void
  onPrev: () => void
  role: Role
}) {
  const periodLines = role.artifactPeriod.split('\n')

  return (
    <section className={`control-screen detail-screen detail-composed-screen detail-role-${role.id}`}>
      <div className="detail-bg-glow" />
      <img className="detail-logo" src={figmaImages.logo} alt="" draggable={false} />
      <ControlBackButton ariaLabel="返回选择页" onClick={onBack} />

      <div className="detail-guardian-stage" aria-hidden="true">
        <div className="detail-guardian-aura" />
        <div className="detail-guardian-reflection">
          <img className="detail-guardian-reflection-img" src={role.previewImage} alt="" draggable={false} />
        </div>
        <img className="detail-guardian-image" src={role.previewImage} alt="" draggable={false} />
        <div className="detail-floor-glow" />
      </div>

      <DetailArrow ariaLabel="上一个守护者" direction="prev" onClick={onPrev} />
      <DetailArrow ariaLabel="下一个守护者" direction="next" onClick={onNext} />

      <article className="detail-artifact-card">
        <header className="detail-artifact-title">
          <DetailTitleWing side="left" />
          <h1>{role.name}</h1>
          <DetailTitleWing side="right" />
        </header>
        <div className="detail-artifact-pattern" />
        <div className="detail-artifact-light" />
        <img className="detail-artifact-image" src={role.artifactImage} alt={role.name} draggable={false} />
        <section className="detail-design-panel">
          <h2>设计原型</h2>
          <p>
            {periodLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </section>
      </article>

      <article className="detail-intro-card">
        <h2>文物简介</h2>
        <p>{role.artifactIntro}</p>
      </article>

      <button aria-label="确认选择" className="detail-confirm" onClick={onConfirm} type="button">
        <span>确认选择</span>
      </button>
      <ControlTimeline activeIndex={1} />
    </section>
  )
}

function DetailTitleWing({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  const filterId = `detail-title-wing-${side}-shadow`

  return (
    <svg
      aria-hidden="true"
      className={`detail-title-wing detail-title-wing-${side}`}
      fill="none"
      viewBox={isLeft ? '0 0 58 32' : '0 0 78 32'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filterId})`}>
        <path
          d={
            isLeft
              ? 'M10.9961 14.7564C10.4457 14.7564 9.99957 15.2026 9.99957 15.7529C9.99957 16.3033 10.4457 16.7495 10.9961 16.7495V15.7529V14.7564ZM47.7495 15.7529L41.9961 9.99952L36.2427 15.7529L41.9961 21.5063L47.7495 15.7529ZM10.9961 15.7529V16.7495H41.9961V15.7529V14.7564H10.9961V15.7529Z'
              : 'M10.0005 15.7529L15.7539 21.5063L21.5073 15.7529L15.7539 9.99952L10.0005 15.7529ZM66.7539 16.7494C67.3043 16.7494 67.7504 16.3033 67.7504 15.7529C67.7504 15.2026 67.3043 14.7564 66.7539 14.7564L66.7539 15.7529L66.7539 16.7494ZM15.7539 15.7529L15.7539 16.7495L66.7539 16.7494L66.7539 15.7529L66.7539 14.7564L15.7539 14.7564L15.7539 15.7529Z'
          }
          fill="white"
        />
      </g>
      <defs>
        <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="31.5059" id={filterId} width={isLeft ? '57.75' : '77.75'} x="0" y="0">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" mode="normal" result={`effect1_dropShadow_${side}`} />
          <feBlend in="SourceGraphic" in2={`effect1_dropShadow_${side}`} mode="normal" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

function DetailArrow({
  ariaLabel,
  direction,
  onClick,
}: {
  ariaLabel: string
  direction: 'prev' | 'next'
  onClick: () => void
}) {
  const isPrev = direction === 'prev'

  return (
    <button aria-label={ariaLabel} className={`detail-arrow detail-arrow-${direction}`} onClick={onClick} type="button">
      <svg aria-hidden="true" className="detail-arrow-icon" fill="none" viewBox="0 0 71 143" xmlns="http://www.w3.org/2000/svg">
        <path
          d={isPrev ? 'M70.2031 15.6826V1.18262L0.703125 68.6826L70.2031 141.683V127.683L16.7031 68.6826L70.2031 15.6826Z' : 'M0.5 15.6826V1.18262L70 68.6826L0.5 141.683V127.683L54 68.6826L0.5 15.6826Z'}
          fill="white"
          fillOpacity="0.22"
          stroke={`url(#detail-arrow-${direction}-stroke)`}
        />
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={`detail-arrow-${direction}-stroke`}
            x1={isPrev ? '70.2031' : '0.5'}
            x2={isPrev ? '0.703125' : '70'}
            y1="71.4326"
            y2="71.4326"
          >
            <stop stopColor="#B5DEF9" />
            <stop offset="0.5" stopColor="#C3C3C3" />
            <stop offset="1" stopColor="#9FD0EC" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  )
}

function GuardianCard({
  card,
  onSelect,
  role,
}: {
  card: (typeof controlCards)[number]
  onSelect: () => void
  role: Role
}) {
  return (
    <article
      className={`guardian-card ${card.imageClass}`}
      style={
        {
          left: `${card.left}rem`,
          top: `${card.top}rem`,
          '--card-gradient': role.cardGradient,
          '--button-gradient': role.buttonGradient,
          '--role-accent': role.accent,
        } as CSSProperties
      }
    >
      <div className="guardian-shadow" />
      <div className="guardian-face" />
      <div className="guardian-mask">
        <img className={`guardian-image ${card.imageClass}`} src={role.previewImage} alt="" draggable={false} />
      </div>
      <div className="guardian-copy">
        <h2>{role.name}</h2>
        <p>{role.description}</p>
        <button aria-label={`选择${role.name}`} className="guardian-select" onClick={onSelect} type="button">
          <span>选择</span>
        </button>
      </div>
    </article>
  )
}

function ControlBackButton({ ariaLabel, onClick }: { ariaLabel: string; onClick: () => void }) {
  return (
    <button aria-label={ariaLabel} className="control-back" onClick={onClick} type="button">
      <svg aria-hidden="true" className="control-back-icon" viewBox="0 0 62 46">
        <path d="M22.8 0 0 18.7l22.8 19V23.3c19.5 0 33.8 9.3 39.2 22.7C59.1 20.5 44.4 6.6 22.8 6.6V0Z" />
      </svg>
      <span>返回</span>
    </button>
  )
}

type ControlTimelineVariant = 'default' | 'result'

function ControlTimeline({ activeIndex, variant = 'default' }: { activeIndex: number; variant?: ControlTimelineVariant }) {
  const layouts = {
    default: {
      ringLefts: [346, 666, 986, 1306],
      dotLefts: [353, 673, 993, 1313],
      labelLefts: [242, 594, 912, 1244],
      lineLeft: 358,
      lineTop: 2174,
      glowTop: 2150,
      ringTop: 2155,
      dotTop: 2161,
      currentTop: 2143,
      labelTop: 2219,
    },
    result: {
      ringLefts: [345, 665, 985, 1305],
      dotLefts: [352, 672, 992, 1312],
      labelLefts: [275, 616, 917, 1252],
      lineLeft: 363,
      lineTop: 2243,
      glowTop: 2219,
      ringTop: 2224,
      dotTop: 2230,
      currentTop: 2212,
      labelTop: 2288,
    },
  }[variant]
  const labels = ['选择守护者', '进入幻装', '倒计时拍照', '生成结果']
  const currentLeft = layouts.ringLefts[activeIndex] - 124

  return (
    <div className="control-timeline" aria-hidden="true">
      <div className="timeline-line" style={{ left: `${layouts.lineLeft}rem`, top: `${layouts.lineTop}rem` }} />
      <div className="timeline-active-glow" style={{ left: `${currentLeft + 48}rem`, top: `${layouts.glowTop}rem` }} />
      <div className="timeline-current" style={{ left: `${currentLeft}rem`, top: `${layouts.currentTop}rem` }} />
      {layouts.ringLefts.map((left) => (
        <span className="timeline-ring" key={`ring-${left}`} style={{ left: `${left}rem`, top: `${layouts.ringTop}rem` }} />
      ))}
      {layouts.dotLefts.map((left) => (
        <span className="timeline-dot" key={`dot-${left}`} style={{ left: `${left}rem`, top: `${layouts.dotTop}rem` }} />
      ))}
      {labels.map((label, index) => (
        <span
          className={index === activeIndex ? 'timeline-label active' : 'timeline-label'}
          key={label}
          style={{ left: `${layouts.labelLefts[index]}rem`, top: `${layouts.labelTop}rem` }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

function ControlIframe({ onBack, role }: { onBack: () => void; role: Role }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    const openScene = () => {
      const plugin = window.kivicubeIframePlugin
      const iframe = frameRef.current
      if (!plugin || !iframe) return false

      void plugin
        .openKivicubeScene(
          iframe,
          {
            sceneId: role.kivicubeSceneId,
            hideLogo: true,
            hideTitle: true,
            hideDownload: true,
            cameraPosition: 'front',
            hideLoading: true,
            hideScan: true,
            hideTakePhoto: false,
            hideBackground: true,
            hideStart: true,
            disableOpenUrl: true,
            trial: true,
          },
          true,
        )
        .then(() => {
          if (!cancelled) setStatus('ready')
        })
        .catch(() => {
          if (!cancelled) setStatus('error')
        })

      return true
    }

    if (openScene()) {
      return () => {
        cancelled = true
      }
    }

    const timer = window.setInterval(() => {
      if (openScene()) {
        window.clearInterval(timer)
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [role])

  return (
    <section className="control-screen iframe-screen">
      <div className="iframe-toolbar">
        <ControlBackButton ariaLabel="返回确认页" onClick={onBack} />
        <div className="iframe-title">
          <strong>{role.name}</strong>
          <span>AR 幻装体验</span>
        </div>
      </div>

      <div className="iframe-shell">
        <iframe
          allow="camera; microphone; gyroscope; accelerometer; magnetometer; fullscreen; clipboard-write"
          allowFullScreen
          className="kivicube-frame"
          key={role.id}
          ref={frameRef}
          title={`${role.name} Kivicube Body AR`}
        />
        {status !== 'ready' && (
          <div className={`iframe-status iframe-status-${status}`}>
            <span>{status === 'error' ? 'AR 加载失败，请检查网络或 Kivicube 插件' : 'AR 加载中'}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function ControlPhoto({ countdown, onStart }: { countdown: number; onStart: () => void }) {
  const displayCountdown = countdown > 0 ? countdown : 5

  return (
    <section className="control-screen photo-screen">
      <img className="photo-bg" src={figmaImages.photoBg} alt="" draggable={false} />
      <div className="photo-bg-overlay" />
      <img className="photo-logo" src={figmaImages.logo} alt="" draggable={false} />
      <h1 className="photo-title">抬头看大屏，倒计时拍照</h1>

      <div className="photo-tip">
        <div className="photo-tip-icon" />
        <p>
          请抬头看大屏，倒计时开始后将自动拍照
          <br />
          保持微笑，展现你的荆楚幻装之美!
        </p>
      </div>

      <div className="photo-ring">
        <div className="photo-ring-solid" />
        <div className="photo-ring-dotted" />
        <div className="photo-count">{displayCountdown}</div>
      </div>

      <button className="photo-start" onClick={onStart} type="button">
        <span className="photo-camera" />
        <span className="photo-start-copy">
          <strong>点击开始倒计时</strong>
          <small>5秒后自动拍照</small>
        </span>
      </button>

      <div className="photo-timeline" aria-hidden="true">
        <div className="photo-timeline-line" />
        <div className="photo-timeline-glow" />
        {[346, 666, 986, 1306].map((left) => (
          <span className="photo-timeline-ring" key={`ring-${left}`} style={{ left: `${left}rem` }} />
        ))}
        {[353, 673, 993, 1313].map((left) => (
          <span className="photo-timeline-dot" key={`dot-${left}`} style={{ left: `${left}rem` }} />
        ))}
        <span className="photo-timeline-label label-1">选择守护者</span>
        <span className="photo-timeline-label label-2">进入幻装</span>
        <span className="photo-timeline-label label-3 active">倒计时拍照</span>
        <span className="photo-timeline-label label-4">生成结果</span>
      </div>
    </section>
  )
}

function ControlResult({ onDone, onRetake, photoUrl }: { onDone: () => void; onRetake: () => void; photoUrl?: string }) {
  return (
    <section className="control-screen result-screen">
      <img className="result-pattern" src={figmaImages.resultPattern} alt="" draggable={false} />
      <div className="result-title-block">
        <span className="result-title-line result-title-line-left" />
        <h1>生成结果</h1>
        <span className="result-title-line result-title-line-right" />
        <p>您的AR试穿效果</p>
      </div>

      <div className="result-photo-frame">{photoUrl && <img src={photoUrl} alt="AR试穿效果" draggable={false} />}</div>

      <div className="result-actions">
        <ResultActionButton caption="保存您的文物造型" icon={QrCode} title="生成二维码" variant="qr" />
        <ResultActionButton caption="重新选择或调整" icon={Camera} onClick={onRetake} title="重拍" variant="retake" />
        <ResultActionButton caption="探索其他珍贵文物" icon={Home} onClick={onDone} title="完成，返回首页" variant="done" />
      </div>

      <ControlTimeline activeIndex={3} variant="result" />
    </section>
  )
}

function ResultActionButton({
  caption,
  icon: Icon,
  onClick,
  title,
  variant,
}: {
  caption: string
  icon: LucideIcon
  onClick?: () => void
  title: string
  variant: 'qr' | 'retake' | 'done'
}) {
  return (
    <button aria-label={title} className={`result-action result-action-${variant}`} onClick={onClick} type="button">
      <Icon aria-hidden="true" className="result-action-icon" strokeWidth={2.1} />
      <span className="result-action-copy">
        <strong>{title}</strong>
        <small>{caption}</small>
      </span>
    </button>
  )
}

export default App
