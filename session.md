大屏页可以接入 iframe了，接入方式就是这个样子：```https://
www.yuque.com/kivicube/manual/h5-access#WollY``` 我们的场景有： 曾侯乙编钟数字穿戴:
6jsme2ldg2vycBt4QkxVa8SQuEswqYIO  元清四爱梅瓶数字穿戴:hsmGzmagmckaKdBuYBW9AlDDEdFriAbv
虎座凤鸟架鼓数字穿戴:rjP1FjcELfZHda6SiHvnE13A5mBSohCo 曾侯乙尊盘穿戴设
scenes/gut9oeLS4H1d1pufkR11d7TNxUg6kzHH``` 这样尺寸大小


• 我会先把现有页面结构和路由找出来，再对照接入方式确认 iframe 参数与展示边界，避免把大
• Ran pwd && rg --files -g '!*node_modules*' | sed -n '1,120p'
  └ /Users/junjieding/dingjunjie_dev/2026_03/0005
    pnpm-workspace.yaml
    … +117 lines (ctrl + t to view transcript)
    apps/web/public/figma/assets/asset-36-c6f5dacfff-1080x1090.png
    apps/web/public/figma/assets/asset-35-c5a50823c8-500x500.png

• Explored
  └ Search control|大屏|穿戴|曾侯乙|编钟|梅瓶|虎座|尊盘|iframe|kivicube|face-scenes
in .
    MM apps/web/src/App.css
    MM apps/web/src/App.tsx

• Searching the web

• Searched

• Searching the web

• Searched site:yuque.com/kivicube/manual h5-access Kivicube iframe

• Searching the web

• Searched https://www.kivicube.com/docs/zh/manual/custom-development/web/h5-access

───────────────────────────────────────────────────────────────────────────────────────

• Kivicube 文档确认了普通 iframe 足够，关键是 allow 里要给相机等权限，宿主必须是 HTTPS
  或
  http://localhost。现在我在看现有大屏和小屏状态是怎么同步的，准备把四个场景收口到角色配置和大屏
  iframe 宿主里。


───────────────────────────────────────────────────────────────────────────────────────
  要改成一个常驻的 iframe 层：四个场景一次性挂载，非当前场景 display: none，预览和倒计
  时都复用同一个可见场景。

• Ran git diff -- apps/server/src/index.ts | sed -n '1,220p'
  └ (no output)

• Ran git diff -- apps/web/src/App.tsx | sed -n '1,260p'
  └ diff --git a/apps/web/src/App.tsx b/apps/web/src/App.tsx
    index 28dcced..c48fa20 100644
    … +13 lines (ctrl + t to view transcript)
             <div className="detail-floor-glow" />
           </div>

• Ran git diff -- apps/web/src/App.css | sed -n '1,260p'
  └ diff --git a/apps/web/src/App.css b/apps/web/src/App.css
    index 97e9ccc..2483c7b 100644
    … +222 lines (ctrl + t to view transcript)

     .detail-floor-glow {

• Searching the web

• Searched

• Searching the web

• Searched Kivicube H5接入 iframe allow camera microphone fullscreen face-scenes

• Ran git show HEAD:apps/web/src/App.css | sed -n '360,520p'
  └   background: rgba(0, 0, 0, 0.46);
    }
    … +157 lines (ctrl + t to view transcript)
      width: 100%;
      height: 100%;

• Ran git show HEAD:apps/web/src/App.tsx | sed -n '250,360p'
  └   const { state } = useRoomSocket('screen')
      const selectedRole = getSelectedRole(state)
    … +108 lines (ctrl + t to view transcript)
        const order = controlCards.map((card) => card.roleId)
        const currentIndex = order.indexOf(detailRole.id)

• Ran git show HEAD:apps/web/src/App.tsx | sed -n '40,125p'
  └   photoGroup: '/figma/original/source-screen-04-763851a1b0-2305x4096.png',
      detailBronze: '/figma/original/iPad-UI-2040_123.png',
    … +83 lines (ctrl + t to view transcript)
      },
    ]

• Ran git show HEAD:apps/web/src/App.css | sed -n '1,120p'
  └ .screen-shell,
    .control-stage {
    … +116 lines (ctrl + t to view transcript)
    }


• Ran git show HEAD:apps/web/src/App.css | sed -n '300,390p'
  └   left: 50%;
      top: 48.4%;
    … +87 lines (ctrl + t to view transcript)

    .screen-countdown-ring::after {

───────────────────────────────────────────────────────────────────────────────────────

• 边界我按现有结构收口：roles 只负责场景 URL 配置，ScreenApp 决定当前阶段/当前角色，新
  增的大屏 Kivicube 层只负责预加载和显隐，不把小屏控制状态继续向下穿很多层。失败语义保
  持现有 error 页；iframe 自身加载失败不额外吞错。

───────────────────────────────────────────────────────────────────────────────────────

• 我现在会改两个前端文件：先替换四个角色的 Kivicube face-scenes URL，再把大屏 iframe
  从“倒计时时临时渲染一个”改为“页面常驻渲染四个，按当前角色和阶段切换 display”。

• Edited apps/web/src/App.tsx (+43 -29)
     67        'linear-gradient(90deg, rgba(111, 130, 128, 0.6) 0%, rgba(207, 233, 224,
          0.6) 50%, rgba(103, 119, 117, 0.6) 100%)',
     68 -    kivicubeUrl: 'https://www.kivicube.com/',
     68 +    kivicubeUrl: 'https://www.kivicube.com/face-scenes/gut9oeLS4H1d1pufkR11d7T
         NxUg6kzHH',
     69    },
        ⋮
     82      buttonGradient: 'linear-gradient(90deg, #6B675B 0%, #D1CCB7 50%, #6F6B5F 1
         00%)',
     83 -    kivicubeUrl: 'https://www.kivicube.com/',
     83 +    kivicubeUrl: 'https://www.kivicube.com/face-scenes/6jsme2ldg2vycBt4QkxVa8S
         QuEswqYIO',
     84    },
        ⋮
     97      buttonGradient: 'linear-gradient(90deg, #7E88A1 0%, #CFD8E9 50%, #7E88A1 1
         00%)',
     98 -    kivicubeUrl: 'https://www.kivicube.com/',
     98 +    kivicubeUrl: 'https://www.kivicube.com/face-scenes/hsmGzmagmckaKdBuYBW9AlD
         DEdFriAbv',
     99    },
        ⋮
    112      buttonGradient: 'linear-gradient(90deg, #826F6F 0%, #E9CFCF 50%, #776767 1
         00%)',
    113 -    kivicubeUrl: 'https://www.kivicube.com/',
    113 +    kivicubeUrl: 'https://www.kivicube.com/face-scenes/rjP1FjcELfZHda6SiHvnE13
         A5mBSohCo',
    114    },
        ⋮
    290    const selectedRole = getSelectedRole(state)
    291 -  const showStage = state.stage === 'countdown'
    291 +  const showKivicubeScene = state.stage === 'preview' || state.stage === 'coun
         tdown'
    292    const showBackground = state.stage !== 'preview'
        ⋮
    301          {state.stage === 'idle' && <ScreenIdleOverlay />}
    302 -        {state.stage === 'preview' && <ScreenArStart />}
    302          {state.stage === 'captured' && <ScreenCapturedOverlay />}
    303
    305 -        {showStage && (
    306 -          <div className="screen-stage">
    307 -            <div className="screen-stage-shell">
    308 -              <iframe
    309 -                className="screen-stage-frame"
    310 -                src={selectedRole.kivicubeUrl}
    311 -                title="Kivicube Body AR"
    312 -                allow="camera; microphone; fullscreen; clipboard-write"
    313 -              />
    314 -              <div className="screen-stage-fallback">
    315 -                <img className="screen-stage-model" src={selectedRole.previewI
         mage} alt="" />
    316 -              </div>
    317 -              {state.stage === 'countdown' && (
    318 -                <div className="screen-countdown" aria-hidden="true">
    319 -                  <div className="screen-countdown-ring" />
    320 -                  <div className="screen-countdown-number">{state.countdown}</
         div>
    321 -                </div>
    322 -              )}
    323 -            </div>
    324 -          </div>
    325 -        )}
    304 +        <ScreenKivicubeStage activeRoleId={selectedRole.id} countdown={state.c
         ountdown} showCountdown={state.stage === 'countdown'} visible={showKivicubeSce
         ne} />
    305
        ⋮
    316
    338 -function ScreenArStart() {
    339 -  return <div className="screen-ar-start">A R 试 穿 页</div>
    317 +function ScreenKivicubeStage({
    318 +  activeRoleId,
    319 +  countdown,
    320 +  showCountdown,
    321 +  visible,
    322 +}: {
    323 +  activeRoleId: string
    324 +  countdown: number
    325 +  showCountdown: boolean
    326 +  visible: boolean
    327 +}) {
    328 +  return (
    329 +    <div className={visible ? 'screen-stage screen-stage-visible' : 'screen-st
         age'} aria-hidden={!visible}>
    330 +      <div className="screen-stage-shell">
    331 +        {roles.map((role) => {
    332 +          const isActive = visible && role.id === activeRoleId
    333 +
    334 +          return (
    335 +            <iframe
    336 +              allow="camera; microphone; gyroscope; accelerometer; magnetomete
         r; fullscreen; clipboard-write"
    337 +              allowFullScreen
    338 +              className={isActive ? 'screen-stage-frame screen-stage-frame-act
         ive' : 'screen-stage-frame'}
    339 +              key={role.id}
    340 +              src={role.kivicubeUrl}
    341 +              title={`${role.name} Kivicube Body AR`}
    342 +            />
    343 +          )
    344 +        })}
    345 +        {showCountdown && (
    346 +          <div className="screen-countdown" aria-hidden="true">
    347 +            <div className="screen-countdown-ring" />
    348 +            <div className="screen-countdown-number">{countdown}</div>
    349 +          </div>
    350 +        )}
    351 +      </div>
    352 +    </div>
    353 +  )
    354  }

• Edited apps/web/src/App.css (+14 -31)
    203
    204 -.screen-ar-start {
    205 -  font-family: 'Source Han Serif SC', 'Noto Serif CJK SC', serif;
    206 -  font-size: 150rem;
    207 -  font-weight: 600;
    208 -  line-height: 1;
    209 -  letter-spacing: 0.72em;
    210 -  color: #fff;
    211 -  white-space: nowrap;
    212 -}
    213 -
    204  .screen-frame-idle .screen-bg {
        ⋮
    435    height: 4977rem;
    436 +  visibility: hidden;
    437 +  opacity: 0;
    438 +  pointer-events: none;
    439  }
    440
    441 +.screen-stage-visible {
    442 +  visibility: visible;
    443 +  opacity: 1;
    444 +  pointer-events: auto;
    445 +}
    446 +
    447  .screen-stage-shell {
        ⋮
    461
    463 -.screen-stage-frame,
    464 -.screen-stage-fallback {
    462 +.screen-stage-frame {
    463    position: absolute;
    464    inset: 0;
    467 -}
    468 -
    469 -.screen-stage-frame {
    465    z-index: 2;
    466 +  display: none;
    467    width: 100%;
        ⋮
    469    border: 0;
    474 -  opacity: 0;
    470 +  background: #000;
    471  }
    472
    477 -.screen-stage-fallback {
    478 -  z-index: 1;
    479 -  display: grid;
    480 -  place-items: center;
    481 -  background:
    482 -    linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.5)),
    483 -    radial-gradient(circle at 50% 54%, rgba(210, 230, 255, 0.22), transparent
         39%);
    484 -}
    485 -
    486 -.screen-stage-model {
    487 -  max-width: 78%;
    488 -  max-height: 96%;
    489 -  object-fit: contain;
    490 -  object-position: center bottom;
    491 -  filter: drop-shadow(0 180rem 264rem rgba(0, 0, 0, 0.6));
    473 +.screen-stage-frame-active {
    474 +  display: block;
    475  }

───────────────────────────────────────────────────────────────────────────────────────

• 代码层改完了：四个 URL 已经进入角色配置，大屏现在始终挂载四个 iframe，只在 preview/
  countdown 展示当前角色；倒计时遮罩继续覆盖在同一个 iframe 容器上。下面我会跑类型检查
  和构建，再用页面状态做一轮实际 DOM/截图验证。

• Ran git diff -- apps/web/src/App.tsx | sed -n '1,260p'
  └ diff --git a/apps/web/src/App.tsx b/apps/web/src/App.tsx
    index 28dcced..14aeafc 100644
    … +136 lines (ctrl + t to view transcript)
             <div className="detail-floor-glow" />
           </div>

• Ran git diff -- apps/web/src/App.css | sed -n '1,260p'
  └ diff --git a/apps/web/src/App.css b/apps/web/src/App.css
    index 97e9ccc..e240712 100644
    … +256 lines (ctrl + t to view transcript)
    -  opacity: 0.32;
    -  filter: blur(1.2rem) saturate(0.76) brightness(1.14);

• Ran pnpm --filter @jingchu/web typecheck
  └
    > @jingchu/web@0.0.0 typecheck /Users/junjieding/dingjunjie_dev/2026_03/0005/apps/
    web
    > tsc -b

    > @jingchu/web@0.0.0 lint /Users/junjieding/dingjunjie_dev/2026_03/0005/apps/web
    > eslint .


• Ran pnpm --filter @jingchu/web build
  └
    > @jingchu/web@0.0.0 build /Users/junjieding/dingjunjie_dev/2026_03/0005/apps/web
    … +9 lines (ctrl + t to view transcript)

    ✓ built in 448ms

───────────────────────────────────────────────────────────────────────────────────────

• 类型检查、前端构建和 lint 都通过了。为了验证“预加载四个 iframe、当前角色可见、其他
  display none”不是只看代码成立，我会启动本地 Vite，用 /screen?stage=preview&role=...
  和倒计时状态检查实际 DOM。

• Ran pnpm exec playwright --version
  └ undefined
     ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command failed with EACCES: playwright
    --version
    spawn playwright EACCES

• Explored
  └ Search playwright|puppeteer in pnpm-lock.yaml

• Ran which d3k || true
  └ /Users/junjieding/.bun/bin/d3k

• Ran which chromium || which google-chrome || which /Applications/Google\
  │ Chrome.app/Contents/MacOS/Google\ Chrome || true
  └ chromium not found
    google-chrome not found
    /Applications/Google Chrome.app/Contents/MacOS/Google Chrome

• Ran d3k --help
  └ Usage: dev3000 [options] [command]

    … +41 lines (ctrl + t to view transcript)
      cdp-port                                Output the CDP port for the current d3k
    session (for use in scripts)

• Ran d3k agent-browser --help
  └
    agent-browser - fast browser automation CLI for AI agents
    … +265 lines (ctrl + t to view transcript)
      agent-browser -p ios tap @e1                             # Touch element


• Ran d3k agent-browser set viewport 562 1000
  └ ✓ Done

• Ran d3k agent-browser open 'http://localhost:5175/screen?stage=preview&role=bell'
  └ ✓ web
      http://localhost:5175/screen?stage=preview&role=bell

• Ran d3k agent-browser wait 2500
  └ ✓ Done

• Ran d3k agent-browser eval "JSON.stringify({stageClass:
  │ document.querySelector('.screen-stage')?.className, stageVisibility:
  │ getComputedStyle(document.querySelector('.screen-stage')).visibility, frames:
  │ … +4 lines
  └ "{\"stageClass\":\"screen-stage screen-stage-visible\",\"stageVisibility\":
    \"visible\",\"frames\":[{\"title\":\"曾侯乙尊盘 Kivicube Body AR\",\"src\":
    … +8 lines (ctrl + t to view transcript)
    rjP1FjcELfZHda6SiHvnE13A5mBSohCo\",\"display\":\"none\",\"width\":0,
    \"height\":0}]}"

───────────────────────────────────────────────────────────────────────────────────────

• DOM 验证到第一条：在 role=bell 的预览页里，页面上确实有 4 个 iframe，只有曾侯乙编钟这
  一项 display: block，另外三个都是 display: none，可见区域尺寸按当前大屏缩放后正常填满
  舞台容器。

• Ran d3k agent-browser screenshot tmp-screen-preview-bell.png
  └ ✓ Screenshot saved to tmp-screen-preview-bell.png

• Ran d3k agent-browser open
  │ 'http://localhost:5175/screen?stage=countdown&role=lacquer&countdown=3'
  └ ✓ web
      http://localhost:5175/screen?stage=countdown&role=lacquer&countdown=3

• Ran d3k agent-browser wait 1000
  └ ✓ Done

• Ran d3k agent-browser eval "JSON.stringify({stageClass:
  │ document.querySelector('.screen-stage')?.className, countdownText:
  │ document.querySelector('.screen-countdown-number')?.textContent, frames:
  │ … +2 lines
  └ "{\"stageClass\":\"screen-stage screen-stage-visible\",\"countdownText\":\"3\",
    \"frames\":[{\"title\":\"曾侯乙尊盘 Kivicube Body AR\",\"src\":\"https://
    … +6 lines (ctrl + t to view transcript)
    www.kivicube.com/face-scenes/rjP1FjcELfZHda6SiHvnE13A5mBSohCo\",\"display\":
    \"block\"}]}"

• Ran d3k agent-browser screenshot tmp-screen-countdown-lacquer.png
  └ ✓ Screenshot saved to tmp-screen-countdown-lacquer.png

• Ran d3k agent-browser open 'http://localhost:5175/screen?stage=idle'
  └ ✓ web
      http://localhost:5175/screen?stage=idle

• Ran d3k agent-browser wait 1000
  └ ✓ Done

• Ran d3k agent-browser eval "JSON.stringify({stageClass:
  │ document.querySelector('.screen-stage')?.className, stageVisibility:
  │ getComputedStyle(document.querySelector('.screen-stage')).visibility, frames:
  │ … +2 lines
  └ "{\"stageClass\":\"screen-stage\",\"stageVisibility\":\"hidden\",\"frames\":
    [{\"title\":\"曾侯乙尊盘 Kivicube Body AR\",\"display\":\"none\",\"src\":\"https://
    … +5 lines (ctrl + t to view transcript)
    Body AR\",\"display\":\"none\",\"src\":\"https://www.kivicube.com/face-scenes/
    rjP1FjcELfZHda6SiHvnE13A5mBSohCo\"}]}"

    … +28 lines (ctrl + t to view transcript)
    https://www.kivicube.com/face-scenes/rjP1FjcELfZHda6SiHvnE13A5mBSohCo (Document) 2
    00

• Viewed Image
  └ tmp-screen-preview-bell.png

• Viewed Image
  └ tmp-screen-countdown-lacquer.png

───────────────────────────────────────────────────────────────────────────────────────

• 截图也确认 iframe 内容实际渲染到了大屏舞台里；本机桌面打开 Kivicube 会显示它自己的二
  维码引导页，这是 Kivicube 侧页面行为，不影响宿主 iframe 接入。最后我会跑整仓类型检
  查，并做一次完成审计。

• Ran pnpm typecheck
  └
    > jingchu-ar-cross-screen@0.1.0 typecheck /Users/junjieding/
    … +6 lines (ctrl + t to view transcript)
    apps/web typecheck: Done
    apps/server typecheck: Done

• Explored
  └ Read App.css, App.tsx

• Ran git status --short
  └ M  apps/server/src/index.ts
    MM apps/web/src/App.css
    MM apps/web/src/App.tsx
    ?? tmp-screen-countdown-lacquer.png
    ?? tmp-screen-preview-bell.png

• Ran rm tmp-screen-preview-bell.png tmp-screen-countdown-lacquer.png
  └ (no output)

↳ Interacted with background terminal · pnpm --filter @jingchu/web dev -- --host
127.0.0.1
  └ 

• Ran pnpm --filter @jingchu/web dev -- --host 127.0.0.1
  └
    > @jingchu/web@0.0.0 dev /Users/junjieding/dingjunjie_dev/2026_03/0005/apps/web
    … +12 lines (ctrl + t to view transcript)
    --host 127.0.0.1`
    Command failed with signal "SIGINT"

• Ran git status --short
  └ M  apps/server/src/index.ts
    MM apps/web/src/App.css
    MM apps/web/src/App.tsx

• Ran d3k agent-browser errors
  └ 💡 Tip: Using `d3k errors` instead (shows browser + server errors)


• Ran d3k errors
  └ 📋 Log file is empty.

───────────────────────────────────────────────────────────────────────────────────────

• 我补一条更严格的预加载证据：清空浏览器网络记录后直接打开 idle 大屏，确认即使当前不展
  示任何场景，四个隐藏 iframe 也会发起 Kivicube 文档请求。

• Ran d3k agent-browser network requests --clear
  └ ✓ Request log cleared

• Ran d3k agent-browser open 'http://localhost:5175/screen?stage=idle'
  └ ✓ web
      http://localhost:5175/screen?stage=idle

• Ran d3k agent-browser wait 2000
  └ ✓ Done

• Ran d3k agent-browser network requests --filter 'kivicube.com/face-scenes'
  └ [E04B7752E23DDCCD7758522B097CD2CB] GET
    https://www.kivicube.com/face-scenes/gut9oeLS4H1d1pufkR11d7TNxUg6kzHH (Document) 2
    … +8 lines (ctrl + t to view transcript)
    https://www.kivicube.com/face-scenes/rjP1FjcELfZHda6SiHvnE13A5mBSohCo (Document) 2
    00

↳ Interacted with background terminal · pnpm --filter @jingchu/web dev -- --host
127.0.0.1
  └ 

• Ran pnpm --filter @jingchu/web dev -- --host 127.0.0.1
  └
    > @jingchu/web@0.0.0 dev /Users/junjieding/dingjunjie_dev/2026_03/0005/apps/web
    … +12 lines (ctrl + t to view transcript)
    --host 127.0.0.1`
    Command failed with signal "SIGINT"

    MM apps/web/src/App.tsx

───────────────────────────────────────────────────────────────────────────────────────

• 我会按前端交付要求把本地预览服务重新拉起来并保持在后台；因为 5173 和 5174 已被占用，
  这里固定用 5175。

• Ran nohup pnpm --filter @jingchu/web exec vite --host 127.0.0.1 --port 5175 > /tmp/
  │ jingchu-web-5175.log 2>&1 & echo $!
  └ 70746

• Ran curl -I http://127.0.0.1:5175/screen?stage=preview\&role=bell
  └ zsh:1: no matches found: http://127.0.0.1:5175/screen?stage=preview&role=bell

⚠ Heads up, you have less than 25% of your 5h limit left. Run /status for a breakdown.

• Ran curl -I 'http://127.0.0.1:5175/screen?stage=preview&role=bell'
  └   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    … +2 lines (ctrl + t to view transcript)
    curl: (7) Failed to connect to 127.0.0.1 port 5175 after 0 ms: Couldn't connect to
    server

• Explored
  └ Read jingchu-web-5175.log

• Ran ps -p 70746 -o pid,stat,command
  └   PID STAT COMMAND

• Ran nohup pnpm --dir apps/web exec vite --host 127.0.0.1 --port 5176 > /tmp/
  │ jingchu-web-5176.log 2>&1 < /dev/null & echo $!
  └ 75621

• Ran sleep 1 && curl -I 'http://127.0.0.1:5176/screen?stage=preview&role=bell'
  └   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    … +2 lines (ctrl + t to view transcript)
    curl: (7) Failed to connect to 127.0.0.1 port 5176 after 0 ms: Couldn't connect to
    server

• Ran sed -n '1,120p' /tmp/jingchu-web-5176.log && ps -p 75621 -o pid,stat,command
  └   PID STAT COMMAND

• Ran curl -I 'http://127.0.0.1:5175/screen?stage=preview&role=bell'
  └   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    … +9 lines (ctrl + t to view transcript)
    Keep-Alive: timeout=5


• Ran git status --short
  └ M  apps/server/src/index.ts
    MM apps/web/src/App.css
    MM apps/web/src/App.tsx

───────────────────────────────────────────────────────────────────────────────────────

• 已完成。按你给的 Kivicube H5 接入方式和 face-scenes URL 格式接入了四个场景：

  - apps/web/src/App.tsx:68 替换为四个实际 Kivicube 场景 URL。
  - apps/web/src/App.tsx:317 新增大屏 ScreenKivicubeStage，页面常驻挂载 4 个 iframe。

  验证结果：

  - pnpm --filter @jingchu/web typecheck 通过
  - pnpm --filter @jingchu/web build 通过
    已预加载

  本地预览服务已启动在：

  http://127.0.0.1:5175/screen?stage=preview&role=bell

  工作区里 apps/server/src/index.ts 仍是已有改动，我没有修改它。目标用时：1201 秒。


› [Image #1]调研一下，不希望一进来是二维码。 ？ 是有什么办法？


• 我先核对 Kivicube 的 H5 接入文档和实际页面行为，再用浏览器模拟移动端看它是不是按设备/
  UA 切二维码页。这样能区分“URL 参数可关掉”和“Kivicube 产品层强制桌面扫码”两类问题。

• Searching the web

• Searched Kivicube H5接入 iframe 二维码 PC 移动端 face-scenes

• Searching the web

• Searched https://www.kivicube.com/docs/zh/manual/custom-development/web/h5-access

• Model interrupted to submit steer instructions.


› 其实主要是接9：16的电视机的。 是不是不适合用这个接？ 那你调研一下


• 我会把问题拆成两件事查：Kivicube 这个 face-scenes H5 是否支持桌面大屏直接用摄像头，以
  及二维码页是否有官方参数能跳过。结论需要基于文档和实际页面行为，不先假设。

• Searching the web

• Searched site:kivicube.com/docs/zh Kivicube H5接入 iframe face-scenes

───────────────────────────────────────────────────────────────────────────────────────

• 我查到官方文档里有一个关键点：普通 iframe 接入是支持的，但“身体 AR 场景嵌入”单独标注
  为需要先购买身体 AR 商用授权并申请开发文档；这已经说明 Body/Face 这类场景不是普通
  scenes iframe 的完全开放能力。我再用实际 URL 测桌面和移动端表现。

• Ran curl -L -s
  │ 'https://www.kivicube.com/face-scenes/gut9oeLS4H1d1pufkR11d7TNxUg6kzHH' | sed -n
  │ '1,120p'
  └ <!doctype html>
    <html lang="en">
    … +71 lines (ctrl + t to view transcript)
      </body>
    </html>

• Ran d3k agent-browser set viewport 562 1000 && d3k agent-browser open
  │ 'https://www.kivicube.com/face-scenes/gut9oeLS4H1d1pufkR11d7TNxUg6kzHH' && d3k a
  │ gent-browser wait 2500 && d3k agent-browser eval "JSON.stringify({url: location.
  │ … +1 lines
  └ ✓ Done
    ✓ 曾侯乙尊盘穿戴设计
    … +4 lines (ctrl + t to view transcript)
    乙尊盘穿戴设计\\n\\n在移动设备上扫描体验\\n\\nhttps://www.kivicube.com/face-scenes/
    gut9oeLS4H1d1pufkR11d7TNxUg6kzHH\\n复制链接\"}"

• Ran d3k agent-browser set device 'iPhone 15 Pro' && d3k agent-browser open
  │ 'https://www.kivicube.com/face-scenes/gut9oeLS4H1d1pufkR11d7TNxUg6kzHH' && d3k a
  │ gent-browser wait 4000 && d3k agent-browser eval "JSON.stringify({url: location.
  │ … +3 lines
  └ ✗ Unknown device: iPhone 15 Pro. Supported: iPhone 15, iPhone 16, iPhone 16 Pro,
    iPhone 17, iPad, iPad Pro, Pixel 9, Galaxy S25

• Ran d3k agent-browser set device 'iPhone 16 Pro' && d3k agent-browser open
  │ 'https://www.kivicube.com/face-scenes/gut9oeLS4H1d1pufkR11d7TNxUg6kzHH' && d3k a
  │ gent-browser wait 5000 && d3k agent-browser eval "JSON.stringify({url: location.
  │ … +3 lines
  └ ✓ Done
    ✓
    … +5 lines (ctrl + t to view transcript)
    X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148
    Safari/604.1\",\"platform\":\"MacIntel\",\"maxTouchPoints\":0}"

• Ran d3k agent-browser wait 10000 && d3k agent-browser eval "JSON.stringify({title:
  │ document.title, text: document.body.innerText.slice(0, 1000), hasVideo: !!
  │ … +2 lines
  └ ✓ Done
    "{\"title\":\"曾侯乙尊盘穿戴设计\",\"text\":\"曾侯乙尊盘穿戴设计\\n51%\",
    \"hasVideo\":true,\"hasCanvas\":true,\"buttons\":[]}"

• Waited for background terminal

───────────────────────────────────────────────────────────────────────────────────────

• 实际 URL 的桌面行为已经复现：普通桌面视口打开会直接显示“在移动设备上扫描体验”的二维码
  页；切成移动设备 UA 后不再出现二维码，而是开始加载场景并创建 video/canvas。这说明二维
  码不是我们 iframe 尺寸造成的，主要是 Kivicube 前端按设备环境分流。
  └ ✓ Screenshot saved to tmp-kivicube-mobile.png

  │ n "iframe|身体|AR|授权|开发文档|相机|https|localhost" -C 2
  └ 5-    <meta name="viewport" content="width=device-width,initial-scale=1">
    37-
    38-  </body>
'https://www.kivicube.com/face-scenes/assets/index-S276-fAT.js' | rg -n "在移动设备上
扫描体验|QRCode|qrcode|mobile|isMobile|userAgent|pc|desktop|scan" -o -C 2

• Ran curl -L -s 'https://www.kivicube.com/face-scenes/assets/index-S276-fAT.js' | rg -
  │ n "在移动设备上扫描体验|QRCode|qrcode|mobile|isMobile|userAgent|pc|desktop|scan"
  │ -o -C 2
  └ 1:userAgent
    1:pc
• Searching the web

• Searched

• Searching the web

• Searched Kivicube 自研H5接入 身体AR 商用授权 iframe

• Searching the web

• Searched https://www.kivicube.com/docs/zh/manual/custom-development/web/h5-access

• Searching the web

• Searched '自研H5' in https://www.kivicube.com/docs/zh/manual/overview/requirements

• Waited for background terminal

───────────────────────────────────────────────────────────────────────────────────────

• 我再把四个资源都走一遍桌面打开的实际结果，避免只拿尊盘这个样本下结论。

• Model interrupted to submit steer instructions.


  https://www.yuque.com/kivicube/manual/web-ar-plugin-quick-start


• 我会直接用 d3k 打开你给的 Yuque 页面，同时对照 Kivicube 官方 docs 里的 Web AR Plugin
  文档。重点看它是不是能绕过 face-scenes 的 PC 二维码分流，以及是否支持身体/试衣类场景
  直接跑在 9:16 电视浏览器上。

• Ran curl -L -s 'https://www.kivicube.com/docs/zh/web-plugin/guide/quick-start' | rg -
  │ n "Web端插件|快速|安装|创建|iframe|scene|body|身体|face|面部|camera|相机|HTTPS|l
  │ ocalhost|授权|license" -C 2
  └ 4-    <meta charset="utf-8">
    5-    <meta name="viewport" content="width=device-width,initial-scale=1">
    … +833 lines (ctrl + t to view transcript)
    47:  </body>
    48-</html>

• Ran curl -L -s 'https://www.kivicube.com/docs/zh/web-plugin/guide/scene-type/body-ar'
  │ | rg -n "身体|body|Body|授权|camera|相机|Web端插件|支持|场景|Kivicube|SDK|Licens
  │ e" -C 2
  └ 4-    <meta charset="utf-8">
    5-    <meta name="viewport" content="width=device-width,initial-scale=1">
    … +1217 lines (ctrl + t to view transcript)
    26:  </body>
    27-</html>

• Waited for background terminal · d3k agent-browser set viewport 1280 900 && d3k agen
t-browser open 'https://www.yuque.com/kivicube/manual/web-ar-plugin-quick-start' && d3k
agent-browser wait 4000 && d3k agent-browser eval "JSON.stringify({url: location.href,
title: document.title, text: document.body.innerText.slice(0, 3000)})"

• Ran d3k agent-browser set viewport 1280 900 && d3k agent-browser open
  │ 'https://www.yuque.com/kivicube/manual/web-ar-plugin-quick-start' && d3k agent-b
  │ rowser wait 4000 && d3k agent-browser eval "JSON.stringify({url: location.href,
  │ … +1 lines
  └ ✓ Done
    ✓ Web版AR插件快速接入 · 语雀
    … +68 lines (ctrl + t to view transcript)
    编辑器中勾选【隐藏体验按钮】时，当用户点击【立即体验】按钮后触发\\n\\n●\\n已经勾选
    【隐藏体验按钮】时，下载场景素材完成事件触发后会紧接\"}"

⚠ Heads up, you have less than 10% of your 5h limit left. Run /status for a breakdown.

───────────────────────────────────────────────────────────────────────────────────────

• Yuque 这篇文档里写得比较明确：它讲的是“Web 版 AR 插件”，但示例和属性围绕 /scenes/
  {sceneId}，不是你现在这批 /face-scenes/{id}。我再核对新版官方 docs 的身体 AR 插件页，
  因为新版侧边栏已经出现了 body-ar，需要确认是不是支持你这种穿戴场景。

• Ran curl -L -s
  │ 'https://www.kivicube.com/docs/assets/zh_web-plugin_guide_scene-type_body-ar.md.C7MQBypf.lean.js'
  │ | rg -n "身体|body|Body|sceneId|Kivicube|plugin|插件|camera|相机|支持|授权|商业|
  │ … +1 lines
  └ 1:import{_ as t,c as r,j as e,a as n,o}from"./chunks/framework.DOHWknVl.js";const
    m=JSON.parse('{"title":"身体AR","description":"了解 Kivicube 身体AR 场景的适用方
    … +8 lines (ctrl + t to view transcript)
    [e("p",null,"@TODO 等待后续支持")],-1)])])}const f=t(i,[["render",s]]);export{m as
    __pageData,f as default};

• Ran curl -L -s
  │ 'https://www.kivicube.com/docs/assets/zh_web-plugin_guide_quick-start.md.BT2ByTWv.lean.js'
  │ | rg -n "支持的场景|身体|面部|scene-id|sceneId|hideStart|cameraPosition|iframe|h
  │ … +1 lines
  └ (no output)

• Ran d3k agent-browser open
  │ 'https://www.kivicube.com/docs/zh/web-plugin/guide/quick-start' && d3k agent-bro
  │ wser wait 2500 && d3k agent-browser eval "JSON.stringify({url: location.href, ti
  │ … +1 lines
  └ ✓ 快速上手 | Kivicube文档中心
      https://www.kivicube.com/docs/zh/web-plugin/guide/quick-start
    … +51 lines (ctrl + t to view transcript)
    ，切换为开发者水印。\\n\\n而开发者水印，需要通过域名授权去除。详细说明见下一页的去
    除水印。\\n\\nPager\\n上一页\\n什么是Kivicube?\\n下一页\\n去除水印\"}"

• Waited for background terminal

───────────────────────────────────────────────────────────────────────────────────────

• 调研结论：现在这批 https://www.kivicube.com/face-scenes/... 不太适合直接 iframe 到接
  9:16 电视的电脑大屏里。

  我用 d3k 看了你给的 Yuque 文档，也对照了新版 Kivicube docs：

  - Web AR Plugin 主要面向 /scenes/{sceneId} 和 /collections/{collectionId}。
  - 官方快速上手明确说高级 iframe plugin 主要支持：
    image2d-tracking 图像 AR、cloud-ar 云识别、web3d 3D 互动。
  - 身体 AR 在新版 Web Plugin 文档里目前还是 @TODO 等待后续支持。
  - 我们现在拿到的是 /face-scenes/{id}，桌面打开会进入“在移动设备上扫描体验”的二维码
    页；移动端 UA 才会继续加载 AR 场景。

  所以问题不是我们 iframe 尺寸没配好，而是 Kivicube 这个 face-scenes 展示端本身对桌面浏
  览器做了二维码分流。

  2. 现场可落地：用移动设备跑 Kivicube，再投到 9:16 电视
     比如 iPad/手机竖屏 HDMI/投屏到电视。这样 Kivicube 识别为移动端，不会先进二维码页。
     但摄像头也会走移动设备，不是电视旁边的 USB 摄像头。
  3. 不建议作为正式方案：伪装桌面 Chrome 为移动端
     d3k 测试里，移动 UA 能绕过二维码并开始加载 video/canvas；但这是 hack，现场稳定性、
     相机权限、触控/方向、Kivicube 后续策略都不可靠。
  4. 如果能把资源改成普通 /scenes 场景
     那就可以走 Web AR Plugin，隐藏默认 UI、监听加载、控制拍照等会更正规。但它目前不等
     价支持这批身体/穿戴 face-scenes。

  我的建议：先不要继续在我们代码里硬调这个 iframe。下一步应该找 Kivicube 确认 /face-
  scenes 是否有“PC 大屏直开”能力；没有的话，大屏电脑接电视这个架构就不适合用现有 face-
  https://www.kivicube.com/docs/zh/web-plugin/guide/scene-type/body-ar

─ Worked for 2m 11s ───────────────────────────────────────────────────────────────────

• Model changed to gpt-5.5 xhigh


› Kivicube 确认 /face-
    scenes 是否有“PC 大屏直开”能力；是啥意思？ 是看我们这个素材是否支持吗


• 不是看“素材本身好不好”，主要是问 Kivicube 这个展示端链接类型和产品能力是否支持 PC 大
  屏。

  你现在的资源是：

  https://www.kivicube.com/face-scenes/{id}

  它在桌面浏览器打开时，Kivicube 会主动显示“在移动设备上扫描体验”的二维码页。意思是
  Kivicube 判断当前是 PC/桌面环境，所以不直接进入相机 AR。

  所以要问的是：

  “我们这几个 /face-scenes 身体/穿戴场景，能不能在 PC Chrome 里直接进入 AR，不显示二维
  码？使用的是外接摄像头，页面会 iframe 到 9:16 电视大屏页面里。”

  更具体可以这样问 Kivicube：

  我们有 4 个 /face-scenes/{id} 的数字穿戴场景，需要接入线下展厅 9:16 竖屏电视。

  现场方案是：Windows/Mac 电脑连接竖屏电视和 USB 摄像头，用 Chrome 全屏打开我们的网页，
  我们网页中 iframe 嵌入 Kivicube 的 /face-scenes 链接。

  现在 PC 浏览器打开 /face-scenes 会显示“在移动设备上扫描体验”的二维码页。

  请问：
  1. /face-scenes 是否支持 PC Chrome + USB 摄像头直接进入 AR 体验？
  2. 是否有 URL 参数、账号配置、白名单、商务授权或大屏/kiosk 模式可以跳过二维码页？
  3. Web AR Plugin 是否支持 /face-scenes 或身体 AR/数字穿戴场景？
  4. 如果不支持，官方推荐的线下大屏接入方案是什么？

  如果他们回答“不支持 PC 直开”，那就不是我们代码能解决的问题；只能改现场方案，比如手机/
  iPad 跑 Kivicube 再投屏，或者让他们提供专门的大屏 SDK/授权方案。


› 把资源改成普通 /scenes ？啥意思？


⚠ Heads up, you have less than 5% of your 5h limit left. Run /status for a breakdown.

• 意思是：Kivicube 里可能存在两类不同的展示链接/场景类型。

  你现在给我们的链接是这种：

  https://www.kivicube.com/face-scenes/gut9oeLS4H1d1pufkR11d7TNxUg6kzHH

  这是 face-scenes，看起来属于面部/身体/穿戴类专用展示端。它在 PC 上会先显示二维码，让
  用户用手机扫。

  而 Kivicube Web AR Plugin 文档里主要支持的是这种普通场景链接：

  https://www.kivicube.com/scenes/n5KxG0svcgNyZof1aWz2kGl6oHNh2JRl

  也就是 /scenes/{sceneId}。这个普通 /scenes 类型可以直接 iframe，也支持插件属性，比如
  隐藏标题、隐藏开始按钮、监听加载进度等。

  所以“把资源改成普通 /scenes”不是我们在代码里把 URL 字符串从 face-scenes 改成 scenes，
  而是要在 Kivicube 平台里确认：

  - 这几个数字穿戴项目能不能发布/导出成普通 /scenes/{id} 链接；
  - 或者 Kivicube 能不能把这些 face-scenes 资源转换成 Web Plugin 支持的普通场景；
  - 或者他们是否有另一套“开发与接入”链接，而不是“分享体验链接”。

  关键点：如果只是把

  /face-scenes/gut9...

  硬改成

  /scenes/gut9...

  大概率会 404 或场景类型不对。必须让 Kivicube 后台或他们技术确认这些资源是否有对应的 /
  scenes 发布 ID。


› 那我直接改？[Image #1]


• 先别直接乱改 URL。你截图里这个是 Kivicube 编辑器，当前场景看起来是身体/穿戴类场景，右
  侧还有 3D跟踪身体模型。这类场景发布出来大概率还是 /face-scenes/... 或身体 AR 专用链



› 为什么必须用face-scenes 直接用lib插件不行吗？ id我们不是给你了吗：<script
  type="text/javascript" src="https://www.kivicube.com/lib/iframe-plugin.js"></script>
  <style type="text/css">
    iframe#kivicubeScene,
    iframe#kivicubeCollection {
      /* 按需设置宽高 */
      width: 100vw;
      height: calc(100vw * (4 / 3));
      /* 去除浏览器自带边框 */
      border: none;
    }
  </style>

  <!-- 接入场景 -->
  <iframe id="kivicubeScene" scene-id="n5KxG0svcgNyZof1aWz2kGl6oHNh2JRl"></iframe>

  <!-- 接入合辑 -->
  <iframe id="kivicubeCollection" collection-id="b46rfc"></iframe> // 全局变量
  kivicubeIframePlugin来自于引入的kivicube lib代码。
  kivicubeIframePlugin.openKivicubeScene(document.querySelector("iframe"), {
    sceneId: "rDM7kXvo1UJKHnQUR46s7neoCSutDul9",
    hideLogo: true, // 是否隐藏首页Logo。默认false
    hideTitle: false, // 是否隐藏首页title。默认false
    hideDownload: false, // 是否隐藏下载进度条。默认false
    cameraPosition: "back", // front: 前置摄像头，back: 后置摄像头。默认后置。
    hideLoading: true, // 是否隐藏加载进度条。默认false
    hideScan: false, // 是否隐藏默认的扫描UI和提示文字。默认false
    hideTakePhoto: false, // 是否隐藏拍照按钮。默认false
    hideBackground: true, // 是否隐藏场景背景。默认false。web3d场景有效。
  });


• 你说得对：不应该先假设“必须 face-scenes”。我现在按你给的插件接入方式实测一遍：把之前
  那几个 ID 当 sceneId 传给 iframe-plugin.js，看它实际会打开 /scenes、成功加载，还是报
  类型/404/二维码分流。
