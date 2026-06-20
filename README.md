# ClipMate v0.9.3

[中文](#中文) | [English](#english)

## 中文

ClipMate 是一款适用于 Google Chrome 和 Microsoft Edge 的 Manifest V3 网页剪藏扩展。它可以将当前网页整理为结构化 Markdown，或在用户明确操作后保存到用户自己的 Notion 页面。

### 核心功能

- **全文剪藏**：提取正文并清理导航、广告、按钮等常见页面噪声。
- **选区剪藏**：保存用户当前选择的文字及适用的上下文。
- **教程模式**：尽量保留标题、列表、代码块、公式、表格、图片题注和视频链接。
- **页面感知推荐**：在本地识别文章、技术页面、讨论、搜索/导航、视频及支持的 AI 对话页面，并给出可覆盖的模式建议。
- **图片点选**：允许用户从当前页面补选图片，支持预览、移除和排序。
- **Markdown 输出**：支持 Notion、Obsidian、Typora 和通用 Markdown 格式。
- **Notion 保存**：支持多个目标页面、默认目标、标签和备注。
- **本地历史**：可选保存剪藏历史，支持搜索、复制、失败重试、单条删除和全部清空。

### 隐私与权限

ClipMate 不使用自有服务器，不包含广告、遥测或远程执行代码，也不会把网页内容发送给外部 AI 服务。

- `storage`：在浏览器本地保存设置、Notion 配置、当前草稿和可选历史。
- `activeTab`：在用户打开 Popup 时识别当前标签页并完成剪藏交互。
- `<all_urls>` 内容脚本：让用户可以在其选择的普通网页上使用通用剪藏功能。
- `https://api.notion.com/*`：仅在用户主动保存时调用 Notion 官方 API。

完整说明见 [隐私政策](PRIVACY_POLICY.md)。

### 获取与加载

商店审核包位于：

```text
release/clipmate-v0.9.3-submission/clipmate-v0.9.3.zip
```

开发者模式加载目录：

```text
release/clipmate-v0.9.3-submission/extension/
```

在 `chrome://extensions` 或 `edge://extensions` 中开启开发者模式，选择“加载已解压的扩展程序”，然后选择上述 `extension/` 目录。

### 从源码构建

```pwsh
cd clipmate-v0.9
npm ci
npm run lint
npm run test
npm run build
```

生产构建输出到 `clipmate-v0.9/dist/`。

### v0.9.3 验证结果

- ESLint：通过。
- Vitest：64 个测试文件、2043 项测试通过。
- 生产构建：通过，Manifest V3 版本为 0.9.3。
- 商店 zip：根目录直接包含唯一 `manifest.json`。

### 已知限制

- 仅支持直接保存到 Notion，使用手动配置的 Notion Integration Token，不支持 OAuth。
- 外部图片通过原始 URL 保存；防盗链、鉴权、过期链接或源站限制可能导致图片无法显示。
- 不提供图片二进制上传、OCR、截图回退、视频下载、字幕抓取或 Notion Database 属性映射。
- 登录墙、封闭 Shadow DOM、虚拟列表和延迟动态渲染可能降低提取完整度。
- 复杂合并单元格表格可能无法完全还原。

### 仓库结构

```text
clipmate-v0.9/                         # v0.9.3 源码与自动化测试
release/clipmate-v0.9.3-submission/   # 审核目录、上传 zip 与商店材料
README.md                              # 中英双语项目说明
PRIVACY_POLICY.md                      # 中英双语隐私政策
```

问题反馈：[GitHub Issues](https://github.com/AlistenerA/clipmate/issues)

## English

ClipMate is a Manifest V3 web-clipping extension for Google Chrome and Microsoft Edge. It turns content from the current webpage into structured Markdown and, only after an explicit user action, can save that content to the user's own Notion page.

### Key features

- **Full-page clipping**: extracts the main content and removes common navigation, advertising, and control noise.
- **Selection clipping**: saves the user's current text selection with applicable context.
- **Tutorial mode**: preserves headings, lists, code blocks, formulas, tables, image captions, and video links when available.
- **Page-aware recommendations**: locally recognizes articles, technical pages, discussions, search/navigation pages, videos, and supported AI conversation pages. Recommendations are always user-overridable.
- **Asset Picker**: lets users add page images, preview them, remove them, and reorder them.
- **Markdown output**: supports Notion, Obsidian, Typora, and generic Markdown profiles.
- **Notion saving**: supports multiple target pages, a default target, tags, and notes.
- **Local history**: optional clipping history with search, copy, failed-save retry, individual deletion, and clear-all controls.

### Privacy and permissions

ClipMate does not use an operator-controlled server and contains no advertising, telemetry, or remotely executed code. It does not send page content to an external AI service.

- `storage`: stores settings, Notion configuration, the current draft, and optional history locally in the browser.
- `activeTab`: identifies the active tab and supports clipping after the user opens the Popup.
- `<all_urls>` content script: enables general clipping on ordinary webpages selected by the user.
- `https://api.notion.com/*`: calls the official Notion API only when the user initiates a save.

See the complete [Privacy Policy](PRIVACY_POLICY.md).

### Install or load

The store-review package is located at:

```text
release/clipmate-v0.9.3-submission/clipmate-v0.9.3.zip
```

The unpacked extension directory is:

```text
release/clipmate-v0.9.3-submission/extension/
```

Enable Developer mode at `chrome://extensions` or `edge://extensions`, choose “Load unpacked,” and select the `extension/` directory above.

### Build from source

```pwsh
cd clipmate-v0.9
npm ci
npm run lint
npm run test
npm run build
```

The production build is written to `clipmate-v0.9/dist/`.

### v0.9.3 verification

- ESLint: passed.
- Vitest: 64 test files and 2043 tests passed.
- Production build: passed; the Manifest V3 version is 0.9.3.
- Store zip: contains exactly one `manifest.json` at its root.

### Known limitations

- Direct saving supports Notion only and uses a manually configured Notion Integration Token; OAuth is not available.
- External images are saved by their original URLs. Hotlink protection, authentication, expired URLs, or source-site restrictions can prevent rendering.
- Binary image upload, OCR, screenshot fallback, video download, subtitle extraction, and Notion Database property mapping are not included.
- Login walls, closed Shadow DOM, virtualized lists, and late dynamic rendering can reduce extraction completeness.
- Complex tables with merged cells may not be reproduced exactly.

### Repository layout

```text
clipmate-v0.9/                         # v0.9.3 source and automated tests
release/clipmate-v0.9.3-submission/   # review directory, upload zip, and store materials
README.md                              # bilingual project documentation
PRIVACY_POLICY.md                      # bilingual privacy policy
```

Support: [GitHub Issues](https://github.com/AlistenerA/clipmate/issues)
