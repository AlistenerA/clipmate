# AGENTS.md

本项目配置了智谱 GLM-4V API，让 DeepSeek 等不支持图片的模型能够通过 GLM 视觉模型解析图片、PDF、Word 文档。

## 架构设计

```
用户上传文件 (PNG/PDF/DOCX)
       ↓
   AI Agent (DeepSeek)
       ↓
┌──────┴──────┐
│ 方式一: MCP  │  ← 优先（重启 opencode 后生效）
│ 方式二: CLI  │  ← 备用（当前会话立即可用）
└──────────────┘
       ↓
  GLM-4V / pdfplumber / python-docx
       ↓
  文本结果返回 Agent
```

## 方式一：MCP 工具（优先，需重启 opencode）

### 可用工具

| 工具名 | 用途 |
|--------|------|
| `read_image` | 使用智谱 GLM-4V 视觉模型分析图片（jpg/png/webp/gif/bmp）|
| `read_pdf` | 读取 PDF 文件，支持本地文本提取或视觉理解 |
| `read_docx` | 读取 Word (.docx) 文件，提取全部文本 |

### MCP 工具选择规则

#### 一、禁止事项

| 禁止行为 | 原因 |
|----------|------|
| 用普通 `Read` 工具读取 .png/.jpg/.jpeg/.webp/.gif/.bmp | deepseek-v4-pro 不支持图片输入 |
| 用普通 `Read` 工具读取 .pdf | PDF 是二进制文件，Read 无法正确解析 |
| 用普通 `Read` 工具读取 .docx/.pptx/.xlsx | 办公文档是二进制文件，Read 无法正确解析 |

#### 二、自动检测触发规则

| 触发条件 | 自动调用的工具 |
|----------|---------------|
| 用户上传图片附件（jpg/png/webp/gif/bmp）| `read_image` |
| 用户提供 PDF 文件路径 | `read_pdf` |
| 用户提供 DOCX 文件路径 | `read_docx` |

#### 三、工作流程

1. 检测到图片/PDF/DOCX → 立即调用对应 MCP 工具获取文本
2. 将工具返回的文本内容作为上下文，结合用户问题给出回答
3. 如果 MCP 工具不可用（未出现在工具列表中），**立即使用方式二 CLI 备用工具**

## 方式二：CLI 备用工具（当前会话立即可用）

当 MCP 工具未加载时，通过 bash 调用 `mcp_server/read_file.py`：

```pwsh
uv run --directory "mcp_server" python read_file.py image "<文件绝对路径>"
uv run --directory "mcp_server" python read_file.py pdf "<文件绝对路径>" [--vision]
uv run --directory "mcp_server" python read_file.py docx "<文件绝对路径>"
```

**AI Agent 使用 CLI 的流程：**

1. 检测到图片/PDF/DOCX 文件
2. 检查 MCP 工具列表中是否有 `read_image` / `read_pdf` / `read_docx`
3. 如果没有 → 用 bash 调用 `read_file.py`，将输出重定向到 `$env:TEMP\opencode\` 下的文件
4. 用 Read 工具读取该输出文件获取文本内容
5. 将文本作为上下文回答用户问题

### 环境变量

API Key 同时配置在以下两处：

1. **系统环境变量**（MCP server 启动时优先读取）：
   ```
   [Environment]::SetEnvironmentVariable("ZHIPUAI_API_KEY", "密钥", "User")
   ```

2. **项目根目录 `.env` 文件**（备用，已加入 `.gitignore`）：
   ```
   ZHIPUAI_API_KEY=你的真实Key
   ```

### 配置要点

**`server.py`**：`load_dotenv` 必须用 `override=True`，防止 opencode 传入空环境变量覆盖 `.env` 的值。

**`opencode.json`**：
```json
{
  "mcp": {
    "file-reader": {
      "type": "local",
      "command": ["uv", "run", "--directory", "mcp_server", "python", "server.py"],
      "enabled": true,
      "timeout": 60000,
      "environment": {}
    }
  }
}
```

### 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| MCP 工具未出现在工具列表 | `opencode.json` 中 `environment` 传了空 `ZHIPUAI_API_KEY` 覆盖了 `.env` | 已修复：`environment` 设为空对象 `{}`，`load_dotenv(override=True)` |
| 图片读取乱码 | PowerShell 默认编码非 UTF-8 | 将输出写入文件后用 Read 工具读取 |
| CLI 报找不到 API Key | `.env` 路径不对 | 检查 `read_file.py` 中 `load_dotenv` 的路径是否为 `Path(__file__).parent.parent / ".env"` |

---

## 网页调研工具选择规则

> 2026-06-08 实测结论：WebFetch 对大部分场景已足够，Playwright 仅用于交互式操作。

### 工具优先级

```
需要浏览网页获取信息？
       ↓
   是 SSR 渲染的页面？
   （Chrome 应用商店、文档站、博客、新闻等）
       ↓
   YES → WebFetch（Token 低 5-10 倍）
   NO  → 需要点击、滚动、填表？
          ↓
         YES → Playwright
         NO  → 尝试 WebFetch，失败再 fallback
```

### 决策矩阵

| 场景 | 使用工具 | 原因 |
|------|---------|------|
| Chrome 应用商店搜索/详情页 | **WebFetch** | SSR 渲染，文本包含评分、用户数等全部关键数据 |
| 阅读技术文档（MDN/Next.js docs） | **WebFetch** | 静态渲染 |
| 阅读博客/新闻文章 | **WebFetch** | 静态渲染 |
| Google/Bing 搜索 | **WebFetch** | 搜索引擎返回 HTML 即可解析 |
| 纯 JS 渲染的 SPA | Playwright | WebFetch 拿不到内容 |
| 需要点击"加载更多" | Playwright | 需要交互 |
| 需要滚动加载的无限列表 | Playwright | 需要交互 |
| 需要填写表单后提交 | Playwright | 需要交互 |
| 需要截图说明问题 | Playwright | WebFetch 无截图能力 |
| 需要阅读 Chrome 插件评价 | WebFetch 尝试详情页 → Playwright 备用 | 部分渲染但可能需点击 |

### Playwright 使用规范

#### 搜索引擎
由于网络环境限制，**使用 Playwright 时优先用 Bing（`https://www.bing.com`）**，而不是 Google：

```
导航到 Bing            → https://www.bing.com
Bing 搜索 URL 模式     → https://www.bing.com/search?q={关键词}
```

#### 避免行为

| 禁止 | 替代方案 |
|------|---------|
| 用 Playwright 爬取静态文档 | 用 WebFetch |
| 用 Playwright 访问 Chrome 应用商店搜索页 | 用 WebFetch |
| 用 Playwright 访问 Chrome 应用商店详情页 | 用 WebFetch（已验证文本数据完整） |
| 在循环中多次 page.goto() 同一站点 | 合并为一次导航 + evaluate 获取数据 |

#### Token 参考数据

| 工具 | 单页 Token | 适用比例 |
|------|:---:|:---:|
| WebFetch | ~500-2,000 | 80% 场景 |
| Playwright | ~5,000-15,000 | 20% 场景（仅交互） |

---

## Token 用量与费用查询

本项目安装了 `token-monitor` 插件，在后台静默追踪每次 AI 对话的 Token 消耗。

### 数据位置

统计文件：`%USERPROFILE%\.config\opencode\token-stats.json`

```json
{
  "totalTokens": 2591176,
  "totalCostRmb": 8.67,
  "sessionCount": 22,
  "sessions": {
    "ses_xxx": {
      "model": "deepseek/deepseek-v4-pro",
      "usage": { "input": 963968, "output": 42752, "reasoning": 55554 },
      "costRmb": 3.48,
      "messageCount": 143
    }
  }
}
```

### 触发规则

| 触发条件 | 动作 |
|----------|------|
| 用户说"查看 tokens"、"费用多少"、"token 统计"等 | **直接用 Read 工具读 `token-stats.json`**，无需 bash |
| 用户询问当前会话消耗 | 从 `sessions` 中找最新的或匹配 title 的条目 |
| 用户问历史累计 | 使用顶层的 `totalTokens` / `totalCostRmb` |

### 费用计算

基于 DeepSeek 官方 RMB 定价：

| 模型 | 输入/百万 | 输出/百万 |
|------|:---:|:---:|
| deepseek-v4-pro | ¥3.00 | ¥6.00 |
| deepseek-v4-flash | ¥1.00 | ¥2.00 |

**注意**：`tokens_cache_read` 不是缓存命中的 token 数（比 input 大十多倍），**不用于计费**。费用按全价输入 +（输出+思考）× 输出价计算。

### 禁止事项

| 禁止 | 原因 |
|------|------|
| 用 bash/Python 直接查 SQLite 数据库 | 需要额外审批步骤，`token-stats.json` 已包含相同数据 |
| 假设 `tokens_cache_read` 是缓存命中数 | 该字段实际含义是 context KV-cache 读取量，与定价无关 |
