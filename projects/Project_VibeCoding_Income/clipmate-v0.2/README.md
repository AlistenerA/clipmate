# ClipMate v0.2

轻量级 Microsoft Edge / Chrome 浏览器扩展，一键将网页内容剪藏到 **Notion**。

比 Notion 官方 Web Clipper（3.3 分 / 100 万+ 用户）更好用的替代品，专注「正文提取 + 标签备注 + Markdown 复制 + Notion 保存」四个核心场景。

---

## v0.2 功能

### 剪藏
- **全文剪藏**：基于 Mozilla Readability 引擎，自动识别文章标题和正文，去除广告和侧边栏
- **选区剪藏**：选中网页文字后一键提取，不再需要「全页保存再手动删除」
- **标签和备注**：剪藏时添加标签和备注，方便后续检索
- **复制 Markdown**：一键生成包含标题、URL、标签、备注、正文的完整 Markdown，粘贴到任何编辑器

### Notion 集成
- **保存到 Notion**：通过 Notion API 直接追加到你的 Notion 页面
- **多 Notion 目标页面**：在 Options 中管理多个 Notion 目标页面（新增/编辑/删除/设置默认）
- **Popup 选择保存目标**：保存时下拉选择目标页面，默认选中默认目标

### 本地剪藏历史
- **历史记录**：保存成功/失败自动写入本地历史，默认保留 100 条
- **历史搜索**：按标题、URL、标签、正文、备注关键词搜索
- **历史复制 Markdown**：重新复制历史条目中的完整 Markdown
- **历史删除**：单条删除或一键清空全部
- **重试保存**：failed / unsaved 历史记录可重新选择目标保存
- **真实网站图标**：历史条目优先显示页面真实 favicon，加载失败时 fallback 到域名首字母头像
- **图片开篇摘要清理**：文章开篇为图片时，摘要不显示 Markdown 图片语法
- **同站不同文章自动刷新 Popup**：同一网站切换文章后打开 Popup 自动提取新内容

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

## Edge 加载扩展

1. 运行 `npm run build`
2. 打开 `edge://extensions`
3. 开启左下角「开发人员模式」
4. 点击「加载解压缩的扩展」，选择 `clipmate-v0.2/dist/` 目录
5. 扩展出现在列表中，工具栏出现 ClipMate 图标

---

## 打包

```pwsh
npm run zip
```

生成 `clipmate-v0.2.zip`，仅包含 dist/ 构建产物，不包含源码、测试、文档、node_modules。

---

## Notion 配置步骤

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations) 创建一个 Integration
   - 选择关联的工作区
   - 复制 `Internal Integration Secret`（格式：`secret_xxx`）
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
- 当用户点击「保存到 Notion」时，成功/失败结果自动写入历史
- **保存完整 Markdown** 用于重新复制和重试保存
- 可在 Options 的「剪藏历史」标签页中搜索、复制、删除、清空、重试
- 关闭历史记录开关后不再写入新历史，已有历史不受影响
- 历史记录中保留目标名称快照，目标被删除后仍可查看来源

---

## 隐私说明

- ClipMate **不收集、不存储、不传输**个人信息到外部服务器
- Notion Token 仅存储在浏览器本地 `chrome.storage.local`
- 剪藏内容仅在用户主动点击保存时直接发送到 Notion 官方 API
- 历史记录保存在本地浏览器，不上传到任何服务器
- 不上传数据到自有服务器、不云同步、不使用 AI 处理用户内容
- 不调用第三方 favicon API（网站图标从页面 DOM 提取）
- 详见隐私政策 `docs/PRIVACY_POLICY_DRAFT.md`

---

## 已知限制

- 仅支持 Notion，不支持飞书、语雀等其他平台
- 手动 Token 配置（非 OAuth 登录），需用户自行创建 Notion Integration
- 正文按纯文本段落保存到 Notion，不保留 Markdown 行内格式（粗体/斜体/代码）
  - 可通过「复制 Markdown」获取完整格式
- Readability 对 SPA（如 Notion 自身页面）可能提取失败，此时降级为 `body.innerText`
- 无 AI 摘要、AI 标签、OCR、截图回退等功能
- 不支持 Notion Database 属性映射
- 复杂网页提取质量依赖 Readability 引擎

---

## 项目结构

```text
clipmate-v0.2/
├── docs/                     # 项目文档
├── public/
│   └── icons/                # 图标资源
├── src/
│   ├── manifest.config.ts    # Manifest V3 配置
│   ├── background/           # Service Worker
│   ├── content/              # Content Script（提取器/解析器）
│   ├── popup/                # Popup UI (React)
│   ├── options/              # Options 设置页 + History UI (React)
│   ├── platforms/notion/     # Notion API 封装
│   └── shared/               # 共享类型/存储/消息/工具
├── tests/                    # 单元测试（321 tests, 13 files）
├── dist/                     # 构建产物
└── package.json
```

---

## 技术栈

TypeScript · React 18 · Vite · @crxjs/vite-plugin · Tailwind CSS · Mozilla Readability · turndown · Vitest
