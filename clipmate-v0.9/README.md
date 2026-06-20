# ClipMate v0.9.3 Source / 源码

[项目说明 / Project overview](../README.md) · [隐私政策 / Privacy Policy](../PRIVACY_POLICY.md)

## 中文

本目录包含 ClipMate v0.9.3 的 TypeScript/React 源码、Manifest V3 配置、图标、本地代码语言识别模型和自动化测试。

### 构建

```pwsh
npm ci
npm run lint
npm run test
npm run build
```

构建产物写入 `dist/`。商店审核使用仓库根目录下的 `release/clipmate-v0.9.3-submission/`，不要上传源码目录或 `node_modules`。

### 运行边界

- 版本：0.9.3
- Manifest：V3
- 权限：`storage`、`activeTab`
- 内容脚本：`<all_urls>`，用于用户选择网页上的通用剪藏
- 外部 API：仅 `https://api.notion.com/*`
- 不使用远程执行代码、遥测、广告或外部 AI 内容处理

### 测试快照

- 64 个测试文件
- 2043 项测试通过
- ESLint 与生产构建通过

## English

This directory contains the TypeScript/React source, Manifest V3 configuration, icons, packaged local code-language model, and automated tests for ClipMate v0.9.3.

### Build

```pwsh
npm ci
npm run lint
npm run test
npm run build
```

Build output is written to `dist/`. Store review uses `release/clipmate-v0.9.3-submission/` at the repository root; do not upload the source directory or `node_modules`.

### Runtime boundaries

- Version: 0.9.3
- Manifest: V3
- Permissions: `storage`, `activeTab`
- Content script: `<all_urls>` for general clipping on webpages selected by the user
- External API: `https://api.notion.com/*` only
- No remotely executed code, telemetry, advertising, or external AI content processing

### Verification snapshot

- 64 test files
- 2043 tests passed
- ESLint and production build passed
