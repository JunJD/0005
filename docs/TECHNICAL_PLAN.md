# 技术方案

## 1. 边界定义

### 大屏 Web

职责：展示 9:16 竖屏体验页面，承载 Kivicube Body AR 链接，接收小屏指令，执行倒计时、拍照/截图、结果提示和回到待机。

输入：后端推送的房间状态、角色选择、拍照指令、Kivicube 场景链接配置。

输出：大屏在线状态、当前阶段、拍照完成事件、可选照片地址。

失败语义：Kivicube 链接加载失败时显示错误态；Socket 断开时显示离线状态；拍照能力不可用时保留倒计时和手动拍照提示。

### 小屏 Web

职责：作为遥控器，选择角色/服饰、触发开始体验、触发拍照、重置流程。

输入：当前房间状态、角色配置。

输出：选择角色、开始拍照、确认完成、重置等控制指令。

失败语义：连接断开时按钮禁用并提示等待重连。

### 本地后端

职责：维护房间状态，连接大屏和小屏，通过 WebSocket 实时同步指令；可扩展为保存照片和生成下载二维码。

输入：大屏注册、小屏注册、控制指令、拍照结果。

输出：房间状态广播、指令转发、健康检查。

失败语义：服务重启后房间状态回到待机；客户端重连后拉取最新状态。

### Kivicube

职责：Body AR 人体识别、真人试穿、模型渲染、Kivicube 内部交互。

本项目不承诺：外部控制 Body AR 骨骼动画、隐藏水印、替换 Kivicube 内部 UI、无刷新切换同一场景内部模型，除非 Kivicube 明确提供个人会员可用 API。

## 2. 技术选型

- Monorepo：pnpm workspace
- 大屏/小屏前端：Vite + React + TypeScript
- 实时通信：Socket.IO
- 本地服务：Fastify + TypeScript
- 图标：lucide-react

选择理由：现场局域网部署简单，开发速度快；Socket.IO 对断线重连处理成熟；前后端职责清晰，不引入过早抽象。

## 3. 页面流程

```text
待机页
↓ 小屏选择角色/服饰
AR 试穿页
↓ 小屏点击拍照
倒计时 5、4、3、2、1
↓
拍照/截图
↓
照片已发送/拍摄完成
↓
回到待机
```

## 4. 数据模型

```ts
type Stage = "idle" | "preview" | "countdown" | "captured" | "error";

type Role = {
  id: string;
  name: string;
  costume: string;
  kivicubeUrl: string;
};

type RoomState = {
  roomId: string;
  stage: Stage;
  selectedRoleId: string;
  countdown: number;
  photoUrl?: string;
  updatedAt: number;
};
```

## 5. 拍照策略

优先级：

1. Kivicube 提供 Body AR 拍照 API：外部触发拍照并返回图片。
2. 浏览器屏幕/标签页捕获：倒计时后截取大屏画面，适合毕业设计演示，需要现场授权和测试。
3. Kivicube 页面内拍照：外层系统只做倒计时和流程提示。

当前个人会员公开资料下，按第 2 或第 3 种预案设计。

## 6. Figma 资源策略

当前链接裸请求返回 CloudFront 403，不能直接用命令行匿名下载。需要以下任一方式：

- 提供 Figma API token，且 token 账号能访问该文件；
- 在 Figma 里把关键画面、背景、按钮、Logo 手动导出后放入 `assets/figma/original`；
- 提供 `.fig` 文件或压缩包。

拿到 token 后可用 Figma REST API 获取节点，再导出 PNG/SVG/PDF 到 `assets/figma/exports`。

## 7. 部署方式

现场推荐：

- 一台大屏电脑连接竖屏电视和摄像头；
- 大屏电脑运行本地服务和网页；
- 小屏手机与大屏电脑在同一局域网；
- 大屏浏览器全屏打开 `/screen`；
- 小屏打开 `/control`。

## 8. 验收标准

- 大屏 9:16 全屏显示，无核心 UI 溢出；
- 小屏和大屏可在同一局域网实时同步；
- 小屏选择角色后，大屏切换对应 Kivicube 链接；
- 小屏触发拍照后，大屏显示倒计时；
- 倒计时结束后进入拍摄完成状态；
- 可重置回待机；
- 服务重启后可重新进入待机并连接。

## 9. 待确认

1. 每个角色/服饰是否有独立 Kivicube Body AR 链接。
2. 是否接受个人会员水印。
3. 是否需要保存照片或生成二维码下载。
4. 现场电脑能否联网访问 Kivicube。
5. 摄像头型号和电视实际分辨率。
6. Figma 是否能提供 API token 或手动导出资源包。
