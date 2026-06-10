# ClipMate v0.1

轻量级浏览器扩展，一键将网页内容剪藏到 **Notion**。

比 Notion 官方 Web Clipper（3.3 分 / 100 万+ 用户）更好用的替代品，专注「正文提取 + 标签备注 + Markdown 复制 + Notion 保存」四个核心场景。

---

## v0.1 功能

- **全文提取**：基于 Mozilla Readability 引擎，自动识别文章标题和正文，去除广告和侧边栏
- **选区剪藏**：选中网页文字后一键提取，不再需要「全页保存再手动删除」
- **标签和备注**：剪藏时添加标签和备注，方便后续检索
- **复制 Markdown**：一键生成包含标题、URL、标签、备注、正文的完整 Markdown，粘贴到任何编辑器
- **保存到 Notion**：通过 Notion API 直接追加到你的 Notion 页面
- **本地存储**：所有配置（Token、Page ID、标签）均保存在浏览器本地，无远程服务器

---

## 本地开发

```pwsh
# 安装依赖
npm install

# 启动开发模式（HMR）
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test

# 代码检查
npm run lint
```

---

## Edge 本地加载 dist

1. 打开 `edge://extensions`
2. 开启左下角「开发人员模式」
3. 点击「加载解压缩的扩展」，选择 `clipmate-v0.1/dist/` 目录
4. 扩展出现在列表中，工具栏出现 ClipMate 图标

---

## 打包

```pwsh
# 方式一：npm 脚本（Windows PowerShell，生成 clipmate-v0.1.zip）
npm run zip
```

**方式二：手动打包**

1. 运行 `npm run build` 生成 `dist/`
2. 选中 `dist/` 目录下的所有文件和文件夹（manifest.json、service-worker-loader.js、assets/、src/）→ 右键压缩
3. 重命名为 `clipmate-v0.1.zip`

确认 zip 内不包含：`src/` 源码文件（非 HTML）、`node_modules/`、`tests/`、`docs/`、`.git/`。

---

## Notion 配置步骤

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations) 创建一个 Integration
   - 选择关联的工作区
   - 复制 `Internal Integration Secret`（格式：`secret_xxx`）
2. 在 Notion 中打开目标页面，点击右上角 `⋯` → `连接` → 添加你创建的 Integration
3. 获取目标页面的 Page ID：
   - 页面 URL 格式：`https://www.notion.so/Page-Name-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 取 `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（32 位十六进制）即为 Page ID
4. 在 ClipMate 的 Options 页面填入 Token 和 Page ID，点击保存

---

## 隐私说明

- ClipMate **不收集、不存储、不传输**任何个人信息到外部服务器
- Notion Token 仅存储在浏览器本地 `chrome.storage.local`
- 剪藏内容直接从浏览器发送到 Notion 官方 API (`https://api.notion.com`)
- 无远程代码执行，无广告追踪，无分析数据收集
- 详见 [隐私政策](docs/PRIVACY_POLICY_DRAFT.md)

---

## 已知限制

- v0.1 仅支持 Notion，不支持飞书、语雀等其他平台
- 正文按纯文本段落保存到 Notion，不保留 Markdown 行内格式（粗体/斜体/代码）
  - 可通过「复制 Markdown」获取完整格式
- Readability 对 SPA（如 Notion 自身页面）可能提取失败，此时降级为 `body.innerText`
- 无 AI 摘要、AI 标签、OCR、截图回退等功能
- 手动 Token 配置（非 OAuth 登录），需用户自行创建 Notion Integration

---

## 项目结构

```text
clipmate-v0.1/
├── docs/                     # 项目文档
├── public/
│   └── icons/                # 图标资源
├── src/
│   ├── manifest.config.ts    # Manifest V3 配置
│   ├── background/           # Service Worker
│   ├── content/              # Content Script（提取器/解析器）
│   ├── popup/                # Popup UI (React)
│   ├── options/              # Options 设置页 (React)
│   ├── platforms/notion/     # Notion API 封装
│   └── shared/               # 共享类型/存储/消息/工具
├── tests/                    # 单元测试
├── dist/                     # 构建产物
└── package.json
```

---

## 技术栈

TypeScript · React 18 · Vite · @crxjs/vite-plugin · Tailwind CSS · Mozilla Readability · turndown · Vitest
