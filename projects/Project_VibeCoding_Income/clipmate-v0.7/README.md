# ClipMate v0.7

轻量级 Microsoft Edge / Chrome 浏览器扩展，一键将网页内容剪藏到 **Notion** 和 **Markdown**。

v0.7 定位为 **Tutorial Mode（教程结构保真版）**，在全文和选区之外增加教程模式，并让 Notion 保留关键文档结构。

---

## v0.7 新特性：教程模式

### ClipDocument
教程模式将 Markdown 解析为带版本的结构化文档，保留标题层级、代码语言、公式、表格、callout、图片题注和视频链接元数据。

### Native Notion Blocks
教程内容保存到 Notion 时映射为 heading、code、equation、table、callout、image 和 bookmark，不再把全部结构压平成普通段落。

### Tutorial Popup Mode
Popup 提供全文、选区、教程三个模式。切换模式会立即重新提取并清空旧内容，History 可识别并显示“教程”。

### Safe Video Metadata
只保存当前页面 DOM 中的 HTTP(S) 视频链接元数据，不下载视频、不抓取字幕、不新增浏览器权限。

---

## v0.5 新特性：文章图片保存

### Article Image Extraction
从文章正文 DOM 中提取图片候选，支持 src/currentSrc/srcset 归一化、figure/figcaption 题注提取、相对 URL 解析。智能过滤 avatar/icon/logo/tracking pixel/emoji/sprite/data URI/blob URI 等噪声图片。

### Markdown Image Preservation
Turndown img rule 增强，过滤噪声图片并去重。相对图片 URL 自动解析为绝对 URL。injectMissingImages 安全网在 Fullpage 末尾补充遗漏的正文图片。

### Notion External Image Blocks
Markdown 图片语法 `![alt](url)` 转换为 Notion `image` block（type: external）。兼容性过滤（代理/resize 型 URL 降级为 paragraph block）。图片 block 转换失败不影响正文保存。支持 image.caption 合并，自动识别图片后紧跟的题注。

### Lightweight Image Metadata
Popup 和 History 中轻量展示图片数量提示（imageCount / firstImageUrl / skippedImageCount），不下载/上传/缓存图片，不保存完整 URL 列表。

---

## v0.4 继承能力（站点适配与场景模式）

### Page Type Detector
通用页面类型检测器，自动识别 7 种页面类型：article（文章）、search-results（搜索）、navigation（导航）、forum-or-comment（论坛/评论）、video（视频）、ai-answer（AI 回复）、unknown。

### Site Profile Engine
结构化站点规则引擎，19 个 seed profiles 覆盖搜索、长视频、短视频、社交/社区、AI 对话 6 类站点。

### Navigation Summary Mode
导航页安全摘要模式：搜索结果页/导航页/低正文高链接页自动触发，生成安全摘要而非无意义地提取导航噪音。

### Comment / Selection Clip Mode
7 种选区上下文识别（selection-generic / comment-selection / forum-selection 等）。有选区时走选区流程，不自动抓取整页评论楼层。

### Site Visual Metadata
站点视觉元数据安全提取器：favicon 优先级提取、themeColor 安全归一化。纯函数 cache strategy，不访问网络。

### Link Card Preview Core
链接卡片预览：类型定义、builder、Markdown serializer。安全 URL 归一化，拒绝危险协议。不访问目标 URL。

---

## v0.3 继承能力（内容保真增强）

- **Markdown Target Profiles**：Notion / Obsidian / Typora / Generic Markdown 四种输出格式
- **LaTeX 公式保留**：保护数学公式文本不被 Markdown 清理破坏
- **Code Block Cleaner**：清理代码块 UI 噪音（复制按钮/行号/语言标签）
- **Image / Link / Table Normalization**：图片多候补 src、链接安全过滤、表格规范化
- **Safe Markdown Preview**：轻量纯函数解析器，不执行 HTML/脚本
- **Article Boundary Guard**：DOM 预清理 + 置信度评估 + 尾部截断 + 低置信兜底

---

## v0.2 继承能力

### 剪藏
- **全文剪藏**：基于 Mozilla Readability 引擎
- **选区剪藏**：选中文字后一键提取
- **标签和备注**：剪藏时添加
- **复制 Markdown**：一键生成完整 Markdown

### Notion 集成
- **保存到 Notion**：通过 Notion API 追加到你的 Notion 页面
- **多 Notion 目标页面**：新增/编辑/删除/设置默认
- **Popup 选择保存目标**

### 本地剪藏历史
- 自动写入本地历史，默认保留 100 条
- 按标题/URL/标签/正文/备注搜索
- 复制 Markdown / 重试保存
- 可关闭历史记录

---

## v0.7 已知限制

- 使用 Notion external image block，不下载、不上传、不缓存图片
- external image URL 依赖源站可访问性，部分外链图片可能因防盗链、代理 URL 或 Notion external image 限制而无法显示
- 代理/resize/API 型图片 URL 可能在 Notion 中无法渲染，v0.5 会尽量过滤或降级为文本链接
- 不接入 Notion File Upload API
- Notion API 不支持由本扩展稳定设置 image block 居中
- 仅支持 Notion，不支持飞书、语雀等平台
- 手动 Token 配置（非 OAuth 登录）
- 无 AI 摘要、AI 标签、OCR、截图回退等功能
- 不支持 Notion Database 属性映射

---

## 本地开发

```pwsh
# 安装依赖
npm install

# 启动开发模式（HMR）
npm run dev

# 代码检查
npm run lint

# 运行测试
npm run test

# 构建生产版本
npm run build

# 打包 zip
npm run zip
```

---

## Edge / Chrome 加载扩展

1. 运行 `npm run build`
2. 打开 `edge://extensions` 或 `chrome://extensions`
3. 开启「开发人员模式」
4. 点击「加载解压缩的扩展」，选择 `clipmate-v0.7/dist/` 目录
5. 扩展出现在列表中，工具栏出现 ClipMate 图标

---

## 打包

```pwsh
npm run zip
```

生成 `clipmate-v0.7.zip`，仅包含 dist/ 构建产物，不包含源码、测试、文档、node_modules。

---

## Notion 配置步骤

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations) 创建一个 Integration
2. 在 Notion 中打开目标页面，点击右上角 `⋯` → `连接` → 添加你创建的 Integration
3. 在 ClipMate 的 Options 页面填入 Token 和目标页面

---

## 隐私说明

- ClipMate **不收集、不存储、不传输**个人信息到外部服务器
- Notion Token 仅存储在浏览器本地 `chrome.storage.local`
- 剪藏内容仅在用户主动点击保存时直接发送到 Notion 官方 API
- 图片采用 external image URL 方式插入 Notion，不下载/上传/缓存图片二进制
- 本地 history 只保存剪藏历史和轻量图片元数据（imageCount / firstImageUrl / skippedImageCount），不记录完整图片 URL 列表
- **不接入 AI API**，不传输用户内容到第三方 LLM
- 不上传数据到自有服务器、不云同步、不做广告追踪
- 不调用第三方 favicon API
- 不远程加载或执行 JavaScript

---

## 项目结构

```text
clipmate-v0.7/
├── docs/                     # 项目文档
├── public/
│   └── icons/                # 图标资源
├── src/
│   ├── manifest.config.ts    # Manifest V3 配置
│   ├── background/           # Service Worker
│   ├── content/              # Content Script（提取器/解析器/边界守护/意图/导航摘要/评论选区/图片提取）
│   ├── popup/                # Popup UI (React)
│   ├── options/              # Options 设置页 + History UI (React)
│   ├── platforms/notion/     # Notion API 封装
│   └── shared/               # 共享类型/存储/消息/Markdown/siteProfiles/siteVisual/linkCard
├── tests/                    # 单元测试（1922 tests, 48 files）
├── dist/                     # 构建产物
└── package.json
```

---

## 技术栈

TypeScript · React 18 · Vite · @crxjs/vite-plugin · Tailwind CSS · Mozilla Readability · turndown · Vitest
