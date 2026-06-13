# ClipMate v0.3

轻量级 Microsoft Edge / Chrome 浏览器扩展，一键将网页内容剪藏到 **Notion** 和 **Markdown**。

比 Notion 官方 Web Clipper（3.3 分 / 100 万+ 用户）更好用的替代品，专注「正文提取 + 标签备注 + Markdown 复制 + Notion 保存」四个核心场景。

---

## v0.3 新特性：内容保真增强

v0.3 把"能剪藏"升级为"剪得准、转得干净、保留结构"，大幅提升 Markdown 输出质量：

### Markdown Target Profiles
支持 **Notion / Obsidian / Typora / Generic Markdown** 四种输出目标。Obisidian 输出自动含 YAML frontmatter，Typora 使用标准 Markdown 链接格式，Notion 保持现有行为。

### LaTeX / 数学公式文本保留
保护 `$...$`、`$$...$$`、`\(...\)`、`\[...\]` 等公式文本，防止 Markdown 清理过程破坏公式。支持从 MathJax / KaTeX 标注的 HTML 恢复 LaTeX 源码。

### Code Block Cleaner
清理代码块外层网页 UI 噪音（复制按钮、行号、语言标签、展开/收起控件），保留语言名和代码内容。支持语言别名映射（js→javascript 等）。

### Image / Link / Table Normalization
- 图片：多候补 src 提取（src / data-src / data-lazy 等），过滤 javascript: 协议
- 链接：安全过滤不安全协议（javascript:/data:），保留 http/https/mailto/tel/锚点
- 表格：简单表格转 Markdown table，复杂表格（colspan/rowspan）走保守简化

### Safe Markdown Preview
轻量纯函数 Markdown 解析器，React 文本节点安全渲染。不使用 dangerouslySetInnerHTML，不加载远程图片，不执行 HTML/脚本。

### Article Boundary Guard
DOM 噪音预清理（tag/role/class 三层过滤）、正文候选评分（high/medium/low 三级置信度）、Markdown 尾部截断（17 个截断模式）、低置信页面兜底（免责提示 + 去重链接上限 10 条）。

---

## v0.2 继承能力

### 剪藏
- **全文剪藏**：基于 Mozilla Readability 引擎，自动识别文章标题和正文，去除广告和侧边栏
- **选区剪藏**：选中网页文字后一键提取
- **标签和备注**：剪藏时添加标签和备注
- **复制 Markdown**：一键生成包含标题、URL、标签、备注、分割线、正文的完整 Markdown

### Notion 集成
- **保存到 Notion**：通过 Notion API 直接追加到你的 Notion 页面
- **多 Notion 目标页面**：在 Options 中管理多个目标（新增/编辑/删除/设置默认）
- **Popup 选择保存目标**：保存时下拉选择目标页面

### 本地剪藏历史
- **历史记录**：自动写入本地历史，默认保留 100 条
- **历史搜索**：按标题、URL、标签、正文、备注关键词搜索
- **历史复制 Markdown / 重试保存**
- **favicon 图标**：优先显示页面真实图标，fallback 域名首字母头像
- **同站自动刷新 Popup**：同一网站切换文章后自动提取新内容

### 本地优先
- **本地存储**：所有配置和历史均保存在浏览器本地，无远程服务器
- **可关闭历史记录**：可在 Options 中关闭历史记录
- **隐私优先**：不收集分析数据，不追踪浏览行为，不使用 AI 处理用户内容

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
4. 点击「加载解压缩的扩展」，选择 `clipmate-v0.3/dist/` 目录
5. 扩展出现在列表中，工具栏出现 ClipMate 图标

---

## 打包

```pwsh
npm run zip
```

生成 `clipmate-v0.3.zip`，仅包含 dist/ 构建产物，不包含源码、测试、文档、node_modules。

---

## Notion 配置步骤

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations) 创建一个 Integration
   - 选择关联的工作区
   - 复制 `Internal Integration Secret`
2. 在 Notion 中打开目标页面，点击右上角 `⋯` → `连接` → 添加你创建的 Integration
3. 在 ClipMate 的 Options 页面：
   - 填入 Token
   - 在「Notion 目标页面」区域点击「添加目标」
   - 填写目标名称和 Page ID（可粘贴完整 Notion 页面 URL，自动提取 Page ID）
   - 可添加多个目标并设置默认目标
4. 点击保存

---

## 历史记录说明

- 历史记录保存在 `chrome.storage.local`
- **默认保留 100 条**，可在 Options 中调整（10-500 条）
- 保存完整 Markdown 用于重新复制和重试保存
- 可在 Options 的「剪藏历史」标签页中搜索、复制、删除、清空、重试
- 关闭历史记录开关后不再写入新历史，已有历史不受影响

---

## 隐私说明

- ClipMate **不收集、不存储、不传输**个人信息到外部服务器
- Notion Token 仅存储在浏览器本地 `chrome.storage.local`
- 剪藏内容仅在用户主动点击保存时直接发送到 Notion 官方 API
- **不接入 AI API**，不传输用户内容到第三方 LLM
- 不上传数据到自有服务器、不云同步、不做广告追踪
- 不调用第三方 favicon API（网站图标从页面 DOM 提取）
- 详见隐私政策 `docs/PRIVACY_POLICY_DRAFT.md`

---

## 已知限制

- 仅支持 Notion，不支持飞书、语雀等其他平台
- 手动 Token 配置（非 OAuth 登录），需用户自行创建 Notion Integration
- 正文按纯文本段落保存到 Notion，不保留 Markdown 行内格式
  - 可通过「复制 Markdown」获取完整格式
- Readability 对 SPA 可能提取失败，此时降级为内容容器提取或 `body.innerText`
- 无 AI 摘要、AI 标签、OCR、截图回退等功能
- 不支持 Notion Database 属性映射

---

## 项目结构

```text
clipmate-v0.3/
├── docs/                     # 项目文档
├── public/
│   └── icons/                # 图标资源
├── src/
│   ├── manifest.config.ts    # Manifest V3 配置
│   ├── background/           # Service Worker
│   ├── content/              # Content Script（提取器/解析器/边界守护）
│   ├── popup/                # Popup UI (React)
│   ├── options/              # Options 设置页 + History UI (React)
│   ├── platforms/notion/     # Notion API 封装
│   └── shared/               # 共享类型/存储/消息/Markdown 工具
├── tests/                    # 单元测试（703 tests, 19 files）
├── dist/                     # 构建产物
└── package.json
```

---

## 技术栈

TypeScript · React 18 · Vite · @crxjs/vite-plugin · Tailwind CSS · Mozilla Readability · turndown · Vitest
