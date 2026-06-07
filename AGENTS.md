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
