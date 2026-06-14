# ClipMate v0.4

轻量级 Microsoft Edge / Chrome 浏览器扩展，一键将网页内容剪藏到 **Notion** 和 **Markdown**。

v0.4 定位为 **Site Profiles and Scenario Modes（站点适配与场景模式版）**，让 ClipMate 更懂"当前页面是什么类型"，并根据页面类型使用更安全的剪藏策略。

---

## v0.4 新特性：站点适配与场景模式

### Page Type Detector
通用页面类型检测器，自动识别 7 种页面类型：article（文章）、search-results（搜索）、navigation（导航）、forum-or-comment（论坛/评论）、video（视频）、ai-answer（AI 回复）、unknown。基于 URL pattern、title keyword、DOM 结构统计量等通用信号，不依赖站点域名硬编码。

### Site Profile Engine
结构化站点规则引擎，19 个 seed profiles 覆盖搜索、长视频、短视频、社交/社区、AI 对话 6 类站点。纯函数匹配引擎（domain/URL pattern 匹配），所有站点适配通过数据配置管理，无散落 `if (domain === 'xxx.com')` 硬编码。

### Intent Signal Collector
用户意图信号采集器，综合 PageType + SiteProfile + SelectionContext + VisibleContext，输出脱敏 IntentSnapshot。支持 14 种意图类型判断，不依赖 AI，无法判断时降级 unknown/needs-ai-later。

### Navigation Summary Mode
导航页安全摘要模式：搜索结果页/导航页/低正文高链接页自动触发，生成标题、URL、domain、页面类型、主要链接列表的安全摘要，而非无意义地提取全部导航噪音。selection-first 永远优先于 navigation summary。

### Comment / Selection Clip Mode
评论/选区模式：7 种选区上下文识别（selection-generic / comment-selection / forum-selection / video-description-selection / video-comment-selection / short-video-caption-selection / ai-answer-selection）。有选区时走选区流程，不自动抓取整页评论楼层。

### Site Visual Metadata
站点视觉元数据安全提取器：favicon 优先级提取（apple-touch-icon > icon > shortcut icon）、themeColor 安全归一化（仅接受 #hex/rgb/hsl）、危险协议拒绝。纯函数 cache strategy（TTL 7 天）。不访问网络验证图标。

### Link Card Preview Core
链接卡片预览：类型定义（LinkCardDraft）、builder（buildLinkCardDraft）、Markdown serializer（formatLinkCardMarkdown）。4 种 LinkCardSource 支持。安全 URL 归一化，拒绝 10 种危险协议。不访问目标 URL，不抓取远程内容。

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

## v0.4 不包含

- 登录系统
- 后端服务器
- AI API（OpenAI/DeepSeek/Claude 等）
- OCR / 截图回退
- 云同步
- 付费功能
- 远程代码执行
- Tag Search UX（deferred to v0.5）
- Better History Config（deferred to v0.5）
- Link Card Popup UI（deferred to v0.5）
- SiteVisual cache persistence（deferred to v0.5）
- Notion 专用 card block（deferred to v0.5）

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
4. 点击「加载解压缩的扩展」，选择 `clipmate-v0.4/dist/` 目录
5. 扩展出现在列表中，工具栏出现 ClipMate 图标

---

## 打包

```pwsh
npm run zip
```

生成 `clipmate-v0.4.zip`，仅包含 dist/ 构建产物，不包含源码、测试、文档、node_modules。

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
- **不接入 AI API**，不传输用户内容到第三方 LLM
- 不上传数据到自有服务器、不云同步、不做广告追踪
- 不调用第三方 favicon API
- 不远程加载或执行 JavaScript

---

## 已知限制

- 仅支持 Notion，不支持飞书、语雀等平台
- 手动 Token 配置（非 OAuth 登录）
- 无 AI 摘要、AI 标签、OCR、截图回退等功能
- 不支持 Notion Database 属性映射
- Link Card Popup UI / History UI 未实现
- Tag Search UX / Better History Config 延后到 v0.5

---

## 项目结构

```text
clipmate-v0.4/
├── docs/                     # 项目文档
├── public/
│   └── icons/                # 图标资源
├── src/
│   ├── manifest.config.ts    # Manifest V3 配置
│   ├── background/           # Service Worker
│   ├── content/              # Content Script（提取器/解析器/边界守护/意图/导航摘要/评论选区）
│   ├── popup/                # Popup UI (React)
│   ├── options/              # Options 设置页 + History UI (React)
│   ├── platforms/notion/     # Notion API 封装
│   └── shared/               # 共享类型/存储/消息/Markdown/siteProfiles/siteVisual/linkCard
├── tests/                    # 单元测试（1383 tests, 32 files）
├── dist/                     # 构建产物
└── package.json
```

---

## 技术栈

TypeScript · React 18 · Vite · @crxjs/vite-plugin · Tailwind CSS · Mozilla Readability · turndown · Vitest
