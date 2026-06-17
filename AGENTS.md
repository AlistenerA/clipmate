# AGENTS.md

本项目配置智谱 GLM-4V API，使 DeepSeek 等不支持图片的模型能通过 GLM 视觉模型解析图片、PDF、Word 文档。

## 架构设计

```
用户上传 (PNG/PDF/DOCX) → AI Agent → 方式一: MCP（优先）←→ 方式二: CLI（备用）
                                       ↓
                              GLM-4V / pdfplumber / python-docx
                                       ↓
                                 文本结果返回 Agent
```

## 方式一：MCP 工具（优先，需重启 opencode）

### 可用工具

| 工具名 | 用途 |
|--------|------|
| `read_image` | GLM-4V 分析图片（jpg/png/webp/gif/bmp）|
| `read_pdf` | 读取 PDF，支持文本提取或视觉理解 |
| `read_docx` | 读取 Word (.docx) 提取全文 |

### 规则

**禁止事项：** 用普通 `Read` 工具读取图片（模型不支持）、PDF/DOCX（二进制，Read 无法解析）。

**自动触发：** 用户上传图片 → `read_image`，用户提供 PDF/DOCX 路径 → `read_pdf` / `read_docx`。

**流程：** 检测到文件 → 调用 MCP 工具获取文本 → 结合用户问题回答。MCP 不可用时立即 fallback 到 CLI。

## 方式二：CLI 备用工具（当前会话立即可用）

```pwsh
uv run --directory "mcp_server" python read_file.py image "<路径>"
uv run --directory "mcp_server" python read_file.py pdf "<路径>" [--vision]
uv run --directory "mcp_server" python read_file.py docx "<路径>"
```

**流程：** 检测文件 → 检查 MCP 工具列表 → 若无，用 bash 调 `read_file.py`，输出重定向到 `$env:TEMP\opencode\` 下文件 → Read 读取 → 回答。

### 环境变量

API Key 配置在**系统环境变量**（MCP server 优先读取）和项目根目录 **`.env`**（备用，已 `.gitignore`）。系统变量通过 `[Environment]::SetEnvironmentVariable("ZHIPUAI_API_KEY", "密钥", "User")` 设置。

### 配置要点

- **`server.py`**：`load_dotenv` 必须 `override=True`，防 opencode 空 env 覆盖 `.env`
- **`opencode.json`**：`environment: {}`（空对象，勿传空 key），命令 `["uv", "run", "--directory", "mcp_server", "python", "server.py"]`

### 常见问题

| 问题 | 原因与解决 |
|------|-----------|
| MCP 工具未出现 | `environment` 传了空 `ZHIPUAI_API_KEY` 覆盖 `.env` → 已修复 |
| 图片读取乱码 | PowerShell 默认非 UTF-8 → 写入文件后用 Read |
| CLI 找不到 API Key | `.env` 路径不对 → 检查 `load_dotenv` 路径为 `Path(__file__).parent.parent / ".env"` |

## 网页调研工具选择规则

> 2026-06-08：WebFetch 对大部分场景已足够，Playwright 仅用于交互。

工具优先级：SSR 页面（文档站、博客、商店等）→ **WebFetch**（Token 低 5-10 倍）；需点击/滚动/填表 → **Playwright**；不确定 → 先 WebFetch，失败再 fallback。

| 场景 | 工具 | 原因 |
|------|------|------|
| Chrome 商店搜索/详情、技术文档、博客、搜索引擎 | WebFetch | SSR 渲染或 HTML 可解析 |
| JS 渲染 SPA、加载更多、滚动无限列表、填表提交、截图 | Playwright | 需交互或无截图能力 |

**Playwright 规范：** 优先用 Bing（`https://www.bing.com/search?q={关键词}`），非 Google。禁止爬取静态文档或用 Playwright 访问商店页。禁止循环 `page.goto()`，合并为一次导航 + `evaluate`。

| 工具 | 单页 Token | 适用比例 |
|------|:---:|:---:|
| WebFetch | ~500-2,000 | 80% |
| Playwright | ~5,000-15,000 | 20%（仅交互）|

## Chrome/Edge 插件开发工作流

本仓库用于迭代 ClipMate 等 Chrome/Edge 插件。开发时默认读取当前最新版本目录（如 `projects/Project_VibeCoding_Income/clipmate-v0.5`）、上一个版本目录和 `other source/` 参考插件代码。`other source/` 仅作架构与实现参考，禁止无审查地整段复制第三方插件代码。

### 工程规则

- 优先遵循现有项目技术栈、目录结构、脚本和 UI 风格。
- Manifest V3 插件重点检查：权限最小化、host permissions、content scripts、service worker 生命周期、异步消息返回、`chrome.runtime.lastError`、storage schema 迁移、CSP、剪贴板/用户数据隐私。
- 涉及依赖/API/浏览器行为时必须查官方或主源文档；优先 `context7`、`gh_grep`、`package-registry`、WebFetch，只有需要交互/截图/真实 DOM 时才用 Playwright。
- 涉及安全、权限、隐私、远程 API、token、剪贴板、用户内容时，必须进行安全和威胁建模检查。

### 浏览器验证

- 需要查看网页元素、DOM、样式、控制台、网络或扩展运行状态时，使用 Playwright MCP。
- 插件 UI 或行为变化后，先构建，再加载 unpacked `dist` 或项目约定输出目录验证。
- 覆盖 popup/options/content script 的核心路径，并检查空状态、错误状态、长内容、权限不足和控制台错误。
- Chrome/Edge 差异相关问题需要分别说明验证浏览器；无法验证时明确说明原因。

### 版本完成标准

每完成一个版本，默认执行：

1. 运行必要的 lint/typecheck/test/build。
2. 本地生成版本归档或 zip，遵循项目已有版本命名。
3. 检查 `git status`，只纳入本次有意修改。
4. commit 并 push 到 GitHub；需要 PR 时创建或更新 PR。
5. 如 GitHub Actions 失败，先读日志再修复，优先只重跑失败任务。

### 远程服务器配置

只有在用户提供或本机已配置 SSH host/key/目标路径时才连接远程服务器。远程改动前先确认目标环境，备份配置文件，避免输出 secrets，使用幂等命令，改完检查服务状态和日志。缺少凭据时不要假装能连接，直接说明需要的信息。

## Token 用量与费用查询

安装 `token-monitor` 插件后台追踪。统计文件：`%USERPROFILE%\.config\opencode\token-stats.json`

**触发：** 用户说"查看 tokens"、"费用多少"等 → 直接用 Read 读 JSON。当前会话从 `sessions` 找最新/匹配项，历史累计用顶层字段。

### 费用计算（DeepSeek RMB 定价）

| 模型 | 输入/百万 | 输出/百万 |
|------|:---:|:---:|
| deepseek-v4-pro | ¥3.00 | ¥6.00 |
| deepseek-v4-flash | ¥1.00 | ¥2.00 |

费用 = 全价输入 +（输出+思考）× 输出价。`tokens_cache_read` 是 KV-cache 读取量，**不用于计费**。

**禁止：** 用 bash 查 SQLite（`token-stats.json` 已包含）；视 `tokens_cache_read` 为缓存命中。

### 输出范式（必须遵守）

```
会话: <title>  (模型: <model>  ·  消息: <messageCount>)
输入   <input> tokens  (¥<inputCost>)
输出   <output> tokens  (¥<outputCost>)
思考   <reasoning> tokens  (¥<reasoningCost>)
────────────────────────
消耗   <total> tokens  ·  ¥<costRmb>

累计   <sessionCount>个会话  ·  <totalTokens> tokens  ·  ¥<totalCostRmb>
```

- 第一行：标题 + 模型 + 消息数；二~四行：输入/输出/思考带各自费用；分隔线后本会话总计；最后历史累计
- Token 缩写：`964.0K` / `1.06M`；费用：`¥3.48`，小于 1 元保留 4 位 `¥0.0398`
- 某项为 0 则省略对应行

**示例：**
```
会话: opencode实时token消耗与费用监控插件查找  (deepseek-v4-pro  143消息)
输入   964.0K tokens  (¥2.89)
输出   42.8K tokens  (¥0.2565)
思考   55.6K tokens  (¥0.3333)
────────────────────────
消耗   1.06M tokens  ·  ¥3.48

累计   22个会话  ·  2.59M tokens  ·  ¥8.67
```
