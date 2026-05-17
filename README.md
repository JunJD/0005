# 荆楚幻装 AR 跨屏互动

线下展厅 9:16 大屏 Body AR 拍照流程原型。Kivicube 负责 AR 场景本身，本项目负责大屏/小屏 UI、本地实时同步、拍照流程和资源管理。

## 运行

网页开发：

```bash
pnpm install
pnpm dev
```

- 大屏端：`http://localhost:5173/screen`
- 小屏端：`http://localhost:5173/control`
- 服务端健康检查：`http://localhost:4000/health`

展会桌面大屏：

```bash
pnpm dev:desktop
```

桌面壳会先确认本地服务和网页已启动，然后打开启动页：

- `进入大屏`：Mac/PC 投屏到电视时使用。大屏页面继续复用 `/screen`，Kivicube AR 由 Electron 独立承载，避免桌面浏览器 iframe 进入扫码页。
- `打开控制台测试`：只用于电脑本机调试控制端。
- `场景预检`：分别打开 4 个 Kivicube 穿戴场景，不启动倒计时，用于展前确认每个场景已加载到可用状态。
- iPad 控制端：让 iPad 和电脑连接同一 WiFi，在 iPad 浏览器打开启动页展示的局域网 `http://<电脑IP>:5173/control` 地址。

## 发布 Windows 安装包

GitHub Actions 会在 `main` 分支上的提交被打 tag 时自动构建 Windows `.exe` 安装包。

推荐 tag 格式：

```bash
git checkout main
git pull origin main
git tag v0.1.0
git push origin v0.1.0
```

触发条件：

- tag 必须 push 到 GitHub。
- tag 指向的提交必须已经在 `origin/main` 上，否则 workflow 会在校验步骤失败。
- tag 名建议使用 `v主版本.次版本.修订号`，例如 `v0.1.0`、`v0.1.1`、`v0.2.0`。

构建完成后，安装包会出现在该 tag 对应的 GitHub Release 附件里，同时 workflow artifact 里也会保留一份。

## Figma 资源

当前 Figma 链接：

`https://www.figma.com/design/UV8uITtoJnJbeTDgFcmFJ8/荆楚幻装UI--改2?node-id=2041-399`

裸请求会被 Figma CloudFront 拦截，无法直接用 `curl` 下载。资源目录已预留：

- `assets/figma/original`：原始导出文件
- `assets/figma/exports`：切图、背景、UI 图片
- `assets/figma/metadata`：Figma 节点清单、导出说明

批量导出需要提供 Figma 登录态或 Figma API token，并确认该文件对 token 账号有访问权限。

拿到 token 后运行：

```bash
FIGMA_TOKEN=你的_token pnpm figma:export
```

如果拿到的是本地 `.fig` 文件，先解包到 `assets/figma/source`，再导入资源：

```bash
mkdir -p assets/figma/source
unzip -o /path/to/荆楚幻装UI.fig -d assets/figma/source
pnpm figma:import-local
```

导入后会生成：

- `assets/figma/source`：`.fig` 解包后的原始内容
- `assets/figma/assets`：补好 `.png` 后缀的素材图
- `assets/figma/original`：按尺寸识别出的高分辨率原图页面
- `assets/figma/metadata/local-assets.json`：本地资源清单
- `apps/web/public/figma`：前端可直接访问的运行时资源
