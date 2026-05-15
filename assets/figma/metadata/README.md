# Figma 导出说明

文件 key：`UV8uITtoJnJbeTDgFcmFJ8`

当前匿名请求结果：Figma/CloudFront 返回 403，无法直接下载设计文件或素材。

推荐导出方式：

1. 在 Figma 生成 Personal Access Token。
2. 确认 token 对应账号可以打开该设计文件。
3. 使用 Figma API 获取节点和图片导出 URL。
4. 将导出的 PNG/SVG 放入 `assets/figma/exports`。

后续可以补脚本：`scripts/export-figma-assets.ts`。
