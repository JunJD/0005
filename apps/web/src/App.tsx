import { Check } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import './App.css'

type Stage = 'idle' | 'preview' | 'countdown' | 'captured' | 'error'

type Role = {
  id: string
  name: string
  costume: string
  artifact: string
  artifactImage: string
  detailImage: string
  artifactPeriod: string
  artifactIntro: string
  description: string
  previewImage: string
  accent: string
  cardGradient: string
  buttonGradient: string
  kivicubeUrl: string
}

type RoomState = {
  roomId: string
  stage: Stage
  selectedRoleId: string
  countdown: number
  photoUrl?: string
  updatedAt: number
}

type ControlPage = 'home' | 'select' | 'detail' | 'photo'

const figmaImages = {
  hero: '/figma/original/source-screen-04-763851a1b0-2305x4096.png',
  ending: '/figma/original/source-screen-06-deb0143475-2304x4096.png',
  photoGroup: '/figma/original/source-screen-04-763851a1b0-2305x4096.png',
  detailBronze: '/figma/original/iPad-UI-2040_123.png',
  detailLacquer: '/figma/original/iPad-UI-2041_283.png',
  detailBell: '/figma/original/iPad-UI-2041_342.png',
  detailPorcelain: '/figma/original/iPad-UI-2042_404.png',
  homeBg: '/figma/assets/asset-20-7f8ad124ce-4096x3039.png',
  photoBg: '/figma/assets/asset-31-abbdc98109-4096x3039.png',
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
    detailImage: figmaImages.detailBronze,
    artifactPeriod: '战国早期（约433年-前423年）\n1978年湖北随州曾侯乙墓出土\n湖北省博物馆镇馆·国家一级文物',
    artifactIntro: '尊盘是青铜礼器，由尊和盘组成。器身饰蟠螭纹与细密纹样，造型工艺华美，代表了战国时期青铜铸造的高峰。',
    description: '楚式青铜铸造技术的巅峰之作',
    previewImage: figmaImages.bronze,
    accent: '#28b985',
    cardGradient: 'linear-gradient(180deg, #717171 0%, #244F3C 50%, #737373 100%)',
    buttonGradient:
      'linear-gradient(90deg, rgba(111, 130, 128, 0.6) 0%, rgba(207, 233, 224, 0.6) 50%, rgba(103, 119, 117, 0.6) 100%)',
    kivicubeUrl: 'https://www.kivicube.com/',
  },
  {
    id: 'bell',
    name: '曾侯乙编钟',
    costume: '楚式深衣',
    artifact: '编钟纹样',
    artifactImage: figmaImages.bellArtifact,
    detailImage: figmaImages.detailBell,
    artifactPeriod: '战国早期（约433年-前423年）\n1978年随州曾侯乙墓出土\n湖北省博物馆镇馆·国家一级文物',
    artifactIntro: '曾侯乙编钟是中国古代礼乐文明的瑰宝，由大小65件青铜编钟组成，音域跨五个半八度，音律精准，气势恢宏。',
    description: '大型礼乐重器，音乐性能完善',
    previewImage: figmaImages.bell,
    accent: '#d9a343',
    cardGradient: 'linear-gradient(180deg, #89898A 0%, #7D6028 50%, #737373 100%)',
    buttonGradient: 'linear-gradient(90deg, #6B675B 0%, #D1CCB7 50%, #6F6B5F 100%)',
    kivicubeUrl: 'https://www.kivicube.com/',
  },
  {
    id: 'porcelain',
    name: '元青花四爱图梅瓶',
    costume: '青花瓷甲',
    artifact: '梅瓶纹样',
    artifactImage: figmaImages.porcelainArtifact,
    detailImage: figmaImages.detailPorcelain,
    artifactPeriod: '元代（1271年-1368年）\n1972年湖北省钟祥市元代窖藏出土\n湖北省博物馆镇馆·国家一级文物',
    artifactIntro: '梅瓶小口、短颈、丰肩，青花纹饰层次丰富。器身绘人物图，寓意高洁品格与文人风雅，是元青花的代表作品之一。',
    description: '元代景德镇窑青花瓷精品',
    previewImage: figmaImages.porcelain,
    accent: '#5b8fe8',
    cardGradient: 'linear-gradient(180deg, #89898B 0%, #365F8B 50%, #737373 100%)',
    buttonGradient: 'linear-gradient(90deg, #7E88A1 0%, #CFD8E9 50%, #7E88A1 100%)',
    kivicubeUrl: 'https://www.kivicube.com/',
  },
  {
    id: 'lacquer',
    name: '虎座鸟架鼓',
    costume: '漆木羽冠',
    artifact: '虎座鸟架鼓',
    artifactImage: figmaImages.lacquerArtifact,
    detailImage: figmaImages.detailLacquer,
    artifactPeriod: '战国中期（距今约2310年）\n2002年湖北枣阳九连墩出土\n湖北省博物馆馆藏·国家一级文物',
    artifactIntro: '虎座鸟架鼓是曾侯乙墓出土的珍贵乐器，以虎为座、鸟为架，造型生动华美，装饰细致，体现了楚国时期高超的漆木工艺。',
    description: '战国时期楚国漆器，造型奇特',
    previewImage: figmaImages.lacquer,
    accent: '#d8463f',
    cardGradient: 'linear-gradient(180deg, #717171 0%, #9D3E35 50%, #737373 100%)',
    buttonGradient: 'linear-gradient(90deg, #826F6F 0%, #E9CFCF 50%, #776767 100%)',
    kivicubeUrl: 'https://www.kivicube.com/',
  },
]

const controlDesign = {
  width: 1668,
  height: 2388,
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
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const nextSocket = io(import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000', {
      transports: ['websocket'],
    })

    nextSocket.on('connect', () => {
      setConnected(true)
      nextSocket.emit('room:join', { roomId: 'main', clientType })
    })

    nextSocket.on('disconnect', () => setConnected(false))
    nextSocket.on('room:state', (nextState: RoomState) => setState(nextState))
    setSocket(nextSocket)

    return () => {
      nextSocket.close()
    }
  }, [clientType])

  return { connected, state, socket }
}

function getSelectedRole(state: RoomState) {
  return roles.find((role) => role.id === state.selectedRoleId) ?? roles[0]
}

function getInitialControlPage(): ControlPage {
  const page = new URLSearchParams(window.location.search).get('page')
  return page === 'select' || page === 'detail' || page === 'photo' ? page : 'home'
}

function getInitialDetailRoleId() {
  const roleId = new URLSearchParams(window.location.search).get('role')
  return roles.some((role) => role.id === roleId) ? roleId! : defaultState.selectedRoleId
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

  if (route.startsWith('/control')) {
    return <ControlApp />
  }

  return <ScreenApp />
}

function ScreenApp() {
  const { state } = useRoomSocket('screen')
  const selectedRole = getSelectedRole(state)
  const showStage = state.stage === 'preview' || state.stage === 'countdown'
  const screenBackground = state.stage === 'captured' ? figmaImages.ending : figmaImages.hero

  return (
    <main className="screen-shell">
      <section className={`screen-frame screen-frame-${state.stage}`}>
        <img className="screen-bg" src={screenBackground} alt="" />

        {showStage && (
          <div className="screen-stage">
            <div className="screen-stage-shell">
              <iframe
                className="screen-stage-frame"
                src={selectedRole.kivicubeUrl}
                title="Kivicube Body AR"
                allow="camera; microphone; fullscreen; clipboard-write"
              />
              <div className="screen-stage-fallback">
                <img className="screen-stage-model" src={selectedRole.previewImage} alt="" />
              </div>
              {state.stage === 'countdown' && (
                <div className="screen-countdown" aria-hidden="true">
                  <div className="screen-countdown-ring" />
                  <div className="screen-countdown-number">{state.countdown}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {state.stage === 'captured' && (
          <div className="screen-result">
            <Check size={56} strokeWidth={2.4} />
            <h2>照片已发送</h2>
            <p>{selectedRole.name} 造型已完成</p>
          </div>
        )}

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

function ControlApp() {
  const { state, socket } = useRoomSocket('control')
  const selectedRole = getSelectedRole(state)
  const [controlPage, setControlPage] = useState<ControlPage>(getInitialControlPage)
  const [detailRoleId, setDetailRoleId] = useState(getInitialDetailRoleId)
  const detailRole = roles.find((role) => role.id === detailRoleId) ?? selectedRole
  useDesignRem(controlDesign.width, controlDesign.height)

  const selectRole = (roleId: string) => {
    setDetailRoleId(roleId)
    socket?.emit('control:select-role', { roomId: 'main', roleId })
    setControlPage('detail')
  }

  const switchDetailRole = (offset: number) => {
    const order = controlCards.map((card) => card.roleId)
    const currentIndex = order.indexOf(detailRole.id)
    const nextRoleId = order[(currentIndex + offset + order.length) % order.length]
    setDetailRoleId(nextRoleId)
    socket?.emit('control:select-role', { roomId: 'main', roleId: nextRoleId })
  }

  return (
    <main className="control-stage">
      <section className="control-scale">
        <div className="control-canvas">
          {controlPage === 'home' ? (
            <ControlHome onEnter={() => setControlPage('select')} />
          ) : controlPage === 'select' ? (
            <ControlSelect
              onBack={() => {
                socket?.emit('control:reset', { roomId: 'main' })
                setControlPage('home')
              }}
              onSelect={selectRole}
            />
          ) : controlPage === 'detail' ? (
            <ControlDetail
              onBack={() => setControlPage('select')}
              onConfirm={() => {
                socket?.emit('control:start-preview', { roomId: 'main' })
                setControlPage('photo')
              }}
              onNext={() => switchDetailRole(1)}
              onPrev={() => switchDetailRole(-1)}
              role={detailRole}
            />
          ) : (
            <ControlPhoto countdown={state.countdown} onStart={() => socket?.emit('control:start-countdown', { roomId: 'main' })} />
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
      <div className="control-glow" />
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
      <div className="control-glow" />
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
  return (
    <section className="control-screen detail-screen">
      <img className="control-screen-img" src={role.detailImage} alt="" draggable={false} />
      <ControlBackButton ariaLabel="返回选择页" onClick={onBack} />
      <button aria-label="上一个守护者" className="hotspot detail-prev-hotspot" onClick={onPrev} type="button" />
      <button aria-label="下一个守护者" className="hotspot detail-next-hotspot" onClick={onNext} type="button" />
      <button aria-label="确认选择" className="hotspot detail-confirm-hotspot" onClick={onConfirm} type="button" />
    </section>
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

function ControlTimeline({ activeIndex }: { activeIndex: number }) {
  const ringLefts = [346, 666, 986, 1306]
  const dotLefts = [353, 673, 993, 1313]
  const labelLefts = [242, 594, 912, 1244]
  const labels = ['选择守护者', '进入幻装', '倒计时拍照', '生成结果']
  const currentLeft = ringLefts[activeIndex] - 124

  return (
    <div className="control-timeline" aria-hidden="true">
      <div className="timeline-line" />
      <div className="timeline-active-glow" style={{ left: `${currentLeft + 48}rem` }} />
      <div className="timeline-current" style={{ left: `${currentLeft}rem` }} />
      {ringLefts.map((left) => (
        <span className="timeline-ring" key={`ring-${left}`} style={{ left: `${left}rem` }} />
      ))}
      {dotLefts.map((left) => (
        <span className="timeline-dot" key={`dot-${left}`} style={{ left: `${left}rem` }} />
      ))}
      {labels.map((label, index) => (
        <span className={index === activeIndex ? 'timeline-label active' : 'timeline-label'} key={label} style={{ left: `${labelLefts[index]}rem` }}>
          {label}
        </span>
      ))}
    </div>
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

export default App
