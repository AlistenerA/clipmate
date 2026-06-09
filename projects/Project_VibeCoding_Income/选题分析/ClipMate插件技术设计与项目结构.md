# 网页剪藏浏览器插件 — 技术设计与项目结构

> 项目代号：ClipMate（暂定名）
> 目标：6-7 天完成 MVP 开发 + 上架 Edge Add-ons
> 核心定位：轻量级网页剪藏工具，专注 Notion/飞书导出，痛点修复优先

---

## 一、竞品源码结构分析

### 1.1 webclipper/web-clipper (6.8k ★)

**语言**: TypeScript 96.7% / JavaScript 1.7% / Less 1.1%
**技术栈**: React + Webpack + pnpm + Vitest
**Manifest**: MV2 → MV3 迁移中
**代码量**: 1300+ commits，活跃维护

```text
web-clipper/
├── src/
│   ├── actions/          # 业务逻辑动作（类似 Redux Actions）
│   ├── common/           # 公共工具函数与常量
│   │   ├── gateways/     # API 网关层（Notion/语雀/OneNote等13+平台）
│   │   ├── backend/      # 后端抽象接口
│   │   └── storage/      # 本地存储封装
│   ├── components/       # React UI 组件
│   ├── extensions/       # 浏览器适配层（Chrome/Firefox/Edge 差异）
│   ├── hooks/            # React Hooks
│   ├── main/             # 入口文件（popup/background/content）
│   ├── models/           # 数据模型
│   ├── pages/            # 页面组件（popup/options）
│   ├── service/          # 服务层
│   ├── services/         # 更底层的服务实现
│   ├── vendor/           # 第三方库封装
│   ├── config.ts         # 全局配置
│   └── index.html        # 入口 HTML
├── chrome/               # Chrome 特定文件（manifest等）
├── bin/                  # 构建脚本
├── webpack/              # Webpack 配置
├── package.json
└── tsconfig.json
```

**核心亮点：**
- 「平台适配器」模式：13+ 平台使用统一接口 `Backend`，新增平台只需实现接口
- 「剪藏方式」三合一：整个页面 / 选中区域 / 书签（URL 快捷保存）
- 「存储抽象层」：localStorage + sync storage 统一封装

### 1.2 Kenshin/simpread 简悦 (8.6k ★)

**语言**: JavaScript 90.9% / CSS 8.2%
**技术栈**: Webpack + jQuery + Node.js
**Manifest**: MV2
**代码量**: 4,572+ commits，重度维护
**特殊架构**: 1.x 开源（GPL），2.x 闭源（标注+稍后读）

```text
simpread/
├── src/                  # 核心源码（2.x 闭源部分）
├── ext/                  # 浏览器扩展外壳
├── webpack.config.js     # 扩展打包配置
├── webpack.config.ext.js # 辅助打包
└── package.json
```

**核心亮点：**
- 「阅读模式引擎」：手工适配数百种网站结构，自动提取标题/描述/正文/图片/视频
- 「标注系统」：5色标注 + 4种样式 + 无限层级标签 + 备注
- 「稍后读系统」：ZK 笔记法 + 双向链接 + 知识图谱 + Mindmap
- 「导出生态」：支持导出到 20+ 平台的自动化方案（简悦的 IFTTT）
- 「同步助手」：桌面端 Electron App，支持自动同步/原生 PDF-Epub/Kindle 发送

### 1.3 Notion Web Clipper（官方闭源）

**特点**：
- 功能极简，安装即用
- 仅支持 Chrome/Firefox/Safari + iOS/Android
- 不支持选择性剪藏
- 不支持剪藏时标签
- 不支持剪切前编辑

### 1.4 Save to Notion（第三方闭源）

**特点**：
- 功能强大但学习曲线陡峭
- 需要用户自己配置 Notion 数据库结构和属性映射
- 支持选择性剪藏、标签系统
- 有重名检测

---

## 二、竞品痛点总结（痛点 → 设计方案）

### 痛点矩阵

| 痛点 | Notion Web Clipper | Save to Notion | web-clipper | 简悦 | **ClipMate 策略** |
|------|:---:|:---:|:---:|:---:|:---:|
| 无法选择性剪藏 | ❌ | ✅ | ✅ | ✅ | ✅ 鼠标框选 + 智能区域识别 |
| 剪藏时不能加标签 | ❌ | ✅ | ❌ | ✅ | ✅ AI 自动标签 + 手动 |
| 部分网页解析失败 | ❌ | ❌ | ❌ | ✅ | ✅ 回退策略：多引擎解析 |
| 不支持国内平台 | ❌ | ❌ | 部分 | ✅ | ✅ Notion + 飞书 + 语雀 |
| UI 复杂，学习成本高 | ✅ | ❌ | 中等 | ❌ | ✅ 极简设计，3 步完成 |
| 无 AI 辅助 | ❌ | ❌ | ❌ | ❌ | ✅ AI 摘要 + 自动标签 |
| 无法离线剪藏 | ✅ | ❌ | ❌ | 部分 | ✅ 离线队列 + 自动同步 |
| 移动端支持弱 | ✅ | ❌ | ❌ | ❌ | ❌ 首版仅桌面 |

### 关键突破点（低成本实现）

| 方向 | 成本 | 价值 | 实现方式 |
|------|:---:|:---:|------|
| AI 自动摘要 | 中 | 高 | 接入通义千问/GLM API，剪藏后自动生成摘要 |
| AI 自动标签 | 低 | 高 | 用 LLM 分析内容，自动推荐 3-5 个标签 |
| 选择性剪藏 | 低 | 高 | 基于 Mozilla Readability + DOM 选择器 |
| 多引擎解析 | 中 | 中 | Readability → HTML → 截图回退三级策略 |
| 离线队列 | 低 | 中 | IndexedDB 存储未提交剪藏，联网后自动同步 |

---

## 三、ClipMate 项目结构设计

### 3.1 总架构

```
                     ┌──────────────────────┐
                     │   Extension Runtime   │
                     └──────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
   ┌────▼─────┐          ┌──────▼──────┐         ┌──────▼──────┐
   │  Popup    │          │ Background  │         │   Content    │
   │  (React)  │◄────────►│  Service    │◄───────►│   Script     │
   │           │ message  │   Worker    │ message │              │
   └───────────┘          └──────┬──────┘         └──────────────┘
        │                        │
        │                        ▼
        │               ┌────────────────┐
        └──────────────►│   Options Page │
                        │    (React)     │
                        └────────────────┘

External Services:
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │  Notion API  │  │  飞书 API    │  │  AI (GLM)    │
   └──────────────┘  └──────────────┘  └──────────────┘
```

### 3.2 完整目录树

```text
clipmate/
├── public/
│   ├── icons/                    # 图标资源（16/32/48/128）
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── screenshots/              # 商店截图素材
│       ├── screenshot-1.png
│       └── ...
│
├── src/
│   ├── manifest.ts               # Manifest 配置（V3）
│   │
│   ├── background/               # Service Worker
│   │   ├── index.ts              # SW 入口（事件监听）         [工作量: 0.3天]
│   │   ├── handlers/             # 消息处理器
│   │   │   ├── clipHandler.ts    # 处理剪藏请求               [0.2天]
│   │   │   ├── authHandler.ts    # 处理认证/Token 管理         [0.1天]
│   │   │   └── syncHandler.ts    # 离线队列同步               [0.2天]
│   │   └── queue/                # 离线队列
│   │       └── offlineQueue.ts   # IndexedDB 队列管理          [0.2天]
│   │
│   ├── content/                  # Content Script
│   │   ├── index.ts              # CS 入口                     [0.1天]
│   │   ├── extractors/           # 内容提取器
│   │   │   ├── readabilityExtractor.ts  # Readability 引擎    [0.3天]
│   │   │   ├── htmlExtractor.ts  # 原始 HTML 回退              [0.1天]
│   │   │   └── screenshotExtractor.ts   # 截图回退 (MVP不含)   [0天]
│   │   ├── selectors/            # DOM 区域选择
│   │   │   ├── areaSelector.ts   # 鼠标框选交互               [0.3天]
│   │   │   └── elementPicker.ts  # 元素级点选                 [0.2天]
│   │   ├── parser/               # 页面元数据解析
│   │   │   ├── metaParser.ts     # og:title/description等     [0.1天]
│   │   │   └── contentCleaner.ts # 去广告/导航栏/侧边栏       [0.2天]
│   │   └── messaging/            # 消息通信
│   │       ├── messageBridge.ts  # 与 SW 的双向通信桥         [0.1天]
│   │       └── portManager.ts    # 长连接管理                  [0.1天]
│   │
│   ├── popup/                    # 弹出窗口 (React)
│   │   ├── index.html
│   │   ├── main.tsx              # React 入口                  [0.1天]
│   │   ├── App.tsx               # 根组件                      [0.1天]
│   │   ├── pages/                # 页面视图
│   │   │   ├── ClipPage.tsx      # 剪藏主页面                  [0.3天]
│   │   │   ├── SettingsPage.tsx  # 快速设置                    [0.2天]
│   │   │   └── HistoryPage.tsx   # 剪藏历史 (MVP不含)         [0天]
│   │   ├── components/           # UI 组件
│   │   │   ├── TargetSelector.tsx    # 目标平台/页面选择器      [0.2天]
│   │   │   ├── ContentPreview.tsx    # 剪藏内容预览             [0.2天]
│   │   │   ├── TagEditor.tsx         # 标签编辑器               [0.2天]
│   │   │   ├── ClipModeToggle.tsx    # 剪藏模式切换(全页/选区)  [0.1天]
│   │   │   ├── AiSummary.tsx         # AI 摘要展示 (MVP不含)   [0天]
│   │   │   ├── StatusBar.tsx         # 状态/进度条              [0.1天]
│   │   │   └── ProBadge.tsx          # 付费功能标识             [0.05天]
│   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── useClipboard.ts   # 剪藏状态管理                [0.1天]
│   │   │   ├── usePages.ts       # 目标页面列表                [0.1天]
│   │   │   ├── useAuth.ts        # 认证状态                    [0.1天]
│   │   │   └── useTags.ts        # 用户标签                    [0.05天]
│   │   └── styles/
│   │       └── popup.css         # Popup 样式 (Tailwind)       [0.1天]
│   │
│   ├── options/                  # 设置页 (React)
│   │   ├── index.html
│   │   ├── main.tsx              # React 入口                  [0.1天]
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── GeneralSettings.tsx   # 通用设置                 [0.2天]
│   │   │   ├── PlatformConfig.tsx    # 平台 API 配置            [0.3天]
│   │   │   ├── ClipRules.tsx         # 剪藏规则                 [0.2天]
│   │   │   └── LicensePage.tsx       # 付费/License管理         [0.2天]
│   │   └── components/
│   │       ├── ApiKeyForm.tsx        # API Key 输入表单          [0.1天]
│   │       ├── TemplateEditor.tsx    # 模板编辑器               [0.2天]
│   │       └── ExportImport.tsx      # 配置导入导出             [0.1天]
│   │
│   ├── platforms/                # 目标平台适配器（核心）
│   │   ├── index.ts              # 平台注册中心                 [0.1天]
│   │   ├── types.ts              # 统一接口 IPlatform           [0.05天]
│   │   ├── notion/
│   │   │   ├── NotionPlatform.ts     # Notion 集成              [0.4天]
│   │   │   ├── notionApi.ts          # Notion API 封装          [0.3天]
│   │   │   ├── notionBlocks.ts       # Block 构造器             [0.2天]
│   │   │   └── notionAuth.ts         # Notion OAuth + Token     [0.2天]
│   │   └── feishu/
│   │       └── FeishuPlatform.ts     # 飞书集成 (MVP可选)      [0天]
│   │
│   ├── shared/                   # 共享代码
│   │   ├── types/                # 全局类型定义
│   │   │   ├── clip.types.ts     # ClipRequest/ClipResult等    [0.05天]
│   │   │   ├── platform.types.ts # 平台通用类型                [0.05天]
│   │   │   └── license.types.ts  # License 相关类型            [0.05天]
│   │   ├── constants/
│   │   │   ├── messageTypes.ts   # 消息类型枚举                [0.05天]
│   │   │   └── config.ts         # 默认配置                    [0.05天]
│   │   ├── utils/
│   │   │   ├── storage.ts        # chrome.storage 封装          [0.1天]
│   │   │   ├── sanitizer.ts      # HTML 清洗 (DOMPurify)       [0.05天]
│   │   │   ├── markdown.ts       # HTML→Markdown 转换           [0.1天]
│   │   │   └── logger.ts         # 调试日志                    [0.05天]
│   │   └── messaging/
│   │       └── messageRouter.ts  # 统一消息路由                [0.1天]
│   │
│   ├── ai/                       # AI 辅助 (MVP Optional)
│   │   ├── summarizer.ts         # AI 摘要生成                  [0天]
│   │   ├── tagGenerator.ts       # AI 标签推荐                 [0天]
│   │   └── glmClient.ts          # GLM-4V API 客户端            [0天]
│   │
│   └── license/                  # 付费验证
│       ├── licenseVerifier.ts    # License Key 验证逻辑         [0.2天]
│       └── featureGate.ts        # 功能开关控制                [0.1天]
│
├── _locales/                     # 国际化
│   ├── en/
│   │   └── messages.json
│   └── zh_CN/
│       └── messages.json
│
├── tests/                        # 测试
│   ├── unit/
│   │   ├── extractors/           # 提取器单元测试
│   │   └── platforms/            # 平台接口测试
│   └── e2e/                      # 端到端 (MVP可选)
│
├── package.json
├── tsconfig.json
├── vite.config.ts                # Vite 构建配置
├── tailwind.config.js
├── .eslintrc.cjs
├── .prettierrc
├── README.md
└── PRIVACY_POLICY.md             # 隐私政策
```

### 3.3 工作量汇总

| 模块 | 子模块 | 估时 | 负责角色 |
|------|--------|:---:|------|
| **Background** | SW 入口 + 消息处理 + 离线队列 | 1天 | 全栈 |
| **Content Script** | 提取器 + 选择器 + 解析器 + 通信 | 1.5天 | 前端为主 |
| **Popup UI** | 剪藏页面 + 组件 + Hooks | 1.2天 | 前端 |
| **Options Page** | 设置页 + 平台配置 | 1.1天 | 前端 |
| **Platforms** | Notion 适配器 + API | 1.1天 | 全栈 |
| **Shared** | 类型/常量/工具/消息路由 | 0.5天 | 全栈 |
| **License** | 付费验证 + 功能开关 | 0.3天 | 全栈 |
| **测试 + 修复** | 功能测试 + Bug 修复 | 1天 | QA |
| **素材 + 上架** | 截图/说明/Partner Center | 0.5天 | PM |
| **总计** | | **7天** | 1人全栈 |

---

## 四、核心模块函数级设计

### 4.1 全局类型定义

```typescript
// src/shared/types/clip.types.ts

/** 剪藏模式 */
type ClipMode = 'fullpage' | 'selection' | 'bookmark';

/** 剪藏请求 */
interface ClipRequest {
  tabId: number;
  url: string;
  title: string;
  mode: ClipMode;
  selectionHtml?: string;     // selection 模式下的选中 HTML
  tags: string[];
  targetPlatform: string;     // 'notion' | 'feishu'
  targetPageId: string;       // 目标 Notion 页面/飞书文档 ID
  note: string;               // 用户备注
}

/** 提取结果 */
interface ExtractResult {
  type: 'article' | 'screenshot' | 'raw_html' | 'error';
  title: string;
  author: string;
  content: string;            // 正文（HTML 或 Markdown）
  excerpt: string;            // 摘要（最多300字）
  length: number;             // 正文字符数
  images: string[];           // 图片 URL 列表
  siteName: string;           // 来源站点
  publishedDate: string;      // 发布日期（如有）
}

/** 剪藏保存结果 */
interface ClipResult {
  success: boolean;
  platformId?: string;        // 目标平台的页面 ID
  error?: string;
  truncated?: boolean;        // 是否因大小限制被截断
}

/** 平台统一接口 */
interface IPlatform {
  readonly id: string;
  readonly name: string;
  savePage(request: ClipRequest, content: ExtractResult): Promise<ClipResult>;
  getPages(authToken: string): Promise<PageInfo[]>;
  validateAuth(authToken: string): Promise<boolean>;
}

interface PageInfo {
  id: string;
  title: string;
  icon?: string;
  parentId?: string;
}
```

### 4.2 Background Service Worker

```typescript
// src/background/index.ts

/** Service Worker 入口 — 注册所有事件监听 */
function registerHandlers(): void

// src/background/handlers/clipHandler.ts

/** 处理剪藏请求的完整流程 */
async function handleClipRequest(msg: ClipRequest): Promise<ClipResult>
  // 1. 向 content script 请求页面内容提取
  // 2. 接收 ExtractResult
  // 3. 调用平台适配器保存
  // 4. 失败时加入离线队列
  // 5. 返回结果

/** 离线重试 */
async function retryQueue(): Promise<void>

// src/background/handlers/authHandler.ts

/** 存储认证 Token */
async function saveAuthToken(platformId: string, token: string): Promise<void>
/** 获取认证 Token */
async function getAuthToken(platformId: string): Promise<string | null>
/** 清除认证 Token */
async function clearAuthToken(platformId: string): Promise<void>

// src/background/handlers/syncHandler.ts

/** 完全同步离线队列 */
async function fullSync(): Promise<void>
/** 获取队列状态 */
function getQueueStatus(): { pending: number; lastSync: number }
```

### 4.3 Content Script

```typescript
// src/content/extractors/readabilityExtractor.ts

/** 使用 Mozilla Readability 提取正文 */
function extractWithReadability(doc: Document): ReadabilityResult | null
  // 返回 { title, content (HTML), excerpt, length, siteName }
  // null 表示解析失败，触发回退

/** 降级策略 — 原始 HTML */
function extractRawHtml(doc: Document): RawHtmlResult

// src/content/extractors/htmlExtractor.ts

/** 从 og: 标签提取元数据 */
function extractOpenGraph(doc: Document): OGMeta
  // { title, description, image, siteName, type, publishedTime }

/** 清理内容（移除 script/style/nav/footer/广告） */
function cleanContent(html: string, baseUrl: string): string

// src/content/selectors/areaSelector.ts

/** 启动框选模式 */
function startAreaSelection(onComplete: (html: string) => void): void
  // 1. 注入 overlay 遮罩层
  // 2. 监听 mousedown/mousemove/mouseup
  // 3. 高亮选中区域
  // 4. 提取选中区域 innerHTML
  // 5. 清理 overlay

/** 取消框选 */
function cancelAreaSelection(): void

// src/content/selectors/elementPicker.ts

/** 启动元素点选模式 */
function startElementPicking(onPick: (element: HTMLElement) => void): void
  // hover 高亮 + click 选择

// src/content/messaging/messageBridge.ts

/** 向 SW 发送消息并等待响应 */
function sendToBackground<T>(type: string, data: unknown): Promise<T>

/** 监听来自 SW 的消息 */
function onBackgroundMessage<T>(type: string, handler: (data: T) => void): void
```

### 4.4 Popup UI (React)

```typescript
// src/popup/pages/ClipPage.tsx

/** 剪藏主页面 */
function ClipPage(): JSX.Element
  // 1. 获取当前 tab 信息
  // 2. 选择剪藏模式 (fullpage/selection)
  // 3. 选择目标平台 + 页面
  // 4. 编辑标签 + 备注
  // 5. 点击保存

// src/popup/components/TargetSelector.tsx

/** 目标选择器组件 */
function TargetSelector(props: {
  platforms: PlatformOption[];
  onSelect: (platform: PlatformOption, page: PageInfo) => void;
}): JSX.Element

// src/popup/components/TagEditor.tsx

/** 标签编辑器 */
function TagEditor(props: {
  tags: string[];
  suggestions: string[];       // AI 建议标签
  onTagsChange: (tags: string[]) => void;
}): JSX.Element

// src/popup/hooks/useClipboard.ts

/** 剪藏状态管理 Hook */
function useClipboard(): {
  mode: ClipMode;
  setMode: (m: ClipMode) => void;
  tags: string[];
  setTags: (t: string[]) => void;
  note: string;
  setNote: (n: string) => void;
  target: Target | null;
  setTarget: (t: Target) => void;
  save: () => Promise<ClipResult>;
  saving: boolean;
  result: ClipResult | null;
}
```

### 4.5 Notion 平台适配器

```typescript
// src/platforms/notion/NotionPlatform.ts

class NotionPlatform implements IPlatform {
  readonly id = 'notion';
  readonly name = 'Notion';

  async savePage(req: ClipRequest, content: ExtractResult): Promise<ClipResult>
  async getPages(authToken: string): Promise<PageInfo[]>
  async validateAuth(authToken: string): Promise<boolean>
}

// src/platforms/notion/notionApi.ts

/** Notion API v1 封装 */
async function createPage(apiToken: string, parentId: string, properties: NotionProperties, children: NotionBlock[]): Promise<string>

async function searchPages(apiToken: string, query: string): Promise<PageInfo[]>
async function getDatabases(apiToken: string): Promise<PageInfo[]>

// src/platforms/notion/notionBlocks.ts

/** HTML → Notion Blocks 转换器 */
function htmlToNotionBlocks(html: string): NotionBlock[]
  // 1. 解析 HTML DOM
  // 2. 按标签类型映射到 Notion Block
  //    <h1-h3> → heading_1/2/3
  //    <p> → paragraph
  //    <img> → image (external URL)
  //    <ul>/<ol> → bulleted_list/numbered_list
  //    <blockquote> → quote
  //    <code> → code
  //    <table> → table (简化)
  // 3. 注意 Notion 单个请求 block 上限 100 个
  // 4. 超出上限时分批处理

// src/platforms/notion/notionAuth.ts

/** Notion OAuth 2.0 流程 */
async function startOAuth(): Promise<void>
async function handleOAuthCallback(url: string): Promise<string>
async function refreshToken(token: string): Promise<string>
```

### 4.6 离线队列

```typescript
// src/background/queue/offlineQueue.ts

/** IndexedDB 离线剪藏队列 */
class OfflineQueue {
  /** 添加剪藏任务到队列 */
  async enqueue(request: ClipRequest, content: ExtractResult): Promise<void>

  /** 获取所有待处理任务 */
  async getPending(): Promise<QueueItem[]>

  /** 标记任务完成 */
  async markComplete(id: string): Promise<void>

  /** 移除任务 */
  async remove(id: string): Promise<void>

  /** 重试所有 pending 任务 */
  async retryAll(platform: IPlatform): Promise<void>

  /** 清空队列 */
  async clear(): Promise<void>

  /** 获取队列统计 */
  async stats(): Promise<{ total: number; pending: number; failed: number }>
}

interface QueueItem {
  id: string;
  request: ClipRequest;
  content: ExtractResult;
  status: 'pending' | 'failed';
  createdAt: number;
  retries: number;
  lastError?: string;
}
```

### 4.7 存储工具

```typescript
// src/shared/utils/storage.ts

/** chrome.storage.sync 封装 — 跨设备同步的小数据 */
async function syncGet<T>(key: string): Promise<T | null>
async function syncSet(key: string, value: unknown): Promise<void>

/** chrome.storage.local 封装 — 大容量本地数据 */
async function localGet<T>(key: string): Promise<T | null>
async function localSet(key: string, value: unknown): Promise<void>

/** 存储键名常量 */
const STORAGE_KEYS = {
  NOTION_TOKEN: 'notion_token',
  FEISHU_TOKEN: 'feishu_token',
  USER_SETTINGS: 'user_settings',
  USER_TAGS: 'user_tags',
  LICENSE_KEY: 'license_key',
  CLIP_HISTORY: 'clip_history',
} as const;
```

### 4.8 付费验证

```typescript
// src/license/licenseVerifier.ts

/** License Key 格式: CPMT-XXXX-XXXX-XXXX */
async function verifyLicense(key: string): Promise<LicenseInfo>

/** 检查是否 Pro 用户 */
async function isProUser(): Promise<boolean>

/** 获取当前 License 状态 */
async function getLicenseStatus(): Promise<LicenseStatus>

type LicenseStatus = 'none' | 'trial' | 'pro' | 'expired';

// src/license/featureGate.ts

/** 功能开关 — 检查是否可以使用指定功能 */
function canUseFeature(feature: string): Promise<boolean>

const FEATURES = {
  MARKDOWN_EXPORT: 'markdown_export',
  AI_SUMMARY: 'ai_summary',
  AI_TAGS: 'ai_tags',
  SELECTIVE_CLIP: 'selective_clip',
  MULTI_PLATFORM: 'multi_platform',
  CUSTOM_TEMPLATES: 'custom_templates',
} as const;
```

---

## 五、6-7 天开发计划

### Day 1: 基础设施 + Content Script 基础

| 时间 | 任务 | 产出 |
|------|------|------|
| 上午 | Vite + React + TS + Manifest V3 脚手架 | 能启动的开发环境 |
| 下午 | Content Script 基础：extractor + parser + cleaner | 能提取并清理网页内容 |
| 晚上 | 消息通信桥 + 类型定义 | SW ↔ CS 能双向通信 |

### Day 2: Content Script 完善 + Popup UI 框架

| 时间 | 任务 | 产出 |
|------|------|------|
| 上午 | 框选选择器 + 元素点选器 | 能选择性剪藏 |
| 下午 | Popup 页面框架 + TargetSelector + ClipPage | Popup UI 可用 |
| 晚上 | 剪藏模式切换 + 状态管理 | 完整剪藏流程 |

### Day 3: Notion 集成 + 离线队列

| 时间 | 任务 | 产出 |
|------|------|------|
| 上午 | Notion OAuth + API 封装 | 能连接 Notion |
| 下午 | Notion Blocks 转换器 | HTML → Notion 格式 |
| 晚上 | 离线队列实现 | 断网时缓存，联网后同步 |

### Day 4: Options Page + License + 测试

| 时间 | 任务 | 产出 |
|------|------|------|
| 上午 | 设置页：API 配置 + 剪藏规则 + License 验证 | 完整的设置面板 |
| 下午 | License 系统对接（Lemon Squeezy Webhook） | 付费功能可用 |
| 晚上 | 全流程测试 + Bug 修复 | 可用的 MVP |

### Day 5: 素材准备 + 上架提交

| 时间 | 任务 | 产出 |
|------|------|------|
| 上午 | 截图制作（6张）+ 宣传图（440×280, 1400×560） | 商店素材 |
| 下午 | Partner Center 填写（隐私声明/权限说明/描述） | 提交审核 |
| 晚上 | 营销准备（推广文案/社交媒体/Product Hunt） | 营销物料 |

### Day 6-7: 缓冲期

- 审核等待（1-7 工作日）
- 根据审核反馈修复问题
- 准备 Chrome Web Store 同步提交
- 建立用户反馈渠道

---

## 六、技术风险与缓解

| 风险 | 等级 | 缓解方案 |
|------|:---:|------|
| Readability 对中文网页解析不佳 | 中 | 1) 回退到原始 HTML 2) 用 GLM-4V 截图解析作为兜底 |
| Notion API Rate Limit (3 req/sec) | 低 | 离线队列削峰，批量处理时自动间隔 |
| Notion Block 100 上限 | 中 | 自动分页，超过 100 blocks 时分多次 API 调用 |
| Edge 审核不通过 | 中 | 严格遵守权限最小化原则，提供详细 Notes |
| 国内用户访问 Notion 慢 | 高 | 本地缓存 + 离线队列 + 网络状态检测 |
| Paywall 导致差评 | 低 | 免费版功能慷慨，Pro 仅增强不割裂 |

---

## 七、已有竞品分析报告参考

本目录下已有分析报告：
- `Chrome插件选题分析报告.md` — Chrome Web Store 市场调研
- `Notion Web Clipper 选题分析报告.md` — 知乎/微博/小红书用户调研
