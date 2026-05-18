# 荆楚幻装 AR 跨屏互动

线下展厅 9:16 大屏 Body AR 拍照流程原型。Kivicube 负责 AR 场景本身，本项目负责大屏/小屏 UI、本地实时同步、拍照流程和资源管理。

## 运行

```bash
pnpm install
pnpm dev
```

- 大屏端：`http://localhost:5173/screen`
- 小屏端：`http://localhost:5173/control`
- 服务端健康检查：`http://localhost:4000/health`

手机投屏测试时，让手机和开发机连接同一 WiFi，在手机浏览器打开：

- 手机大屏端：`http://<开发机IP>:5173/screen`
- 控制端：`http://<开发机IP>:5173/control`

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
