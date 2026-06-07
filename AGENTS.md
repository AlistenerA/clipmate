# AGENTS.md

This repo contains OpenCode project configuration including MCP server setup for file parsing (images, PDFs, Word documents).

## MCP 文件解析器

本项目配置了一个本地 MCP server (`file-reader`)，用于解析图片、PDF 和 Word 文档。

### 可用工具

| 工具名 | 用途 |
|--------|------|
| `read_image` | 使用智谱 GLM-4V 视觉模型分析图片文件（jpg/png/webp/gif/bmp）|
| `read_pdf` | 读取 PDF 文件，支持本地文本提取或视觉理解 |
| `read_docx` | 读取 Word (.docx) 文件，提取全部文本 |

### 前置条件

1. Python 3.10+ 已安装
2. `uv` 包管理器已安装：`pip install uv`
3. 已按照 `docs/mcp-file-reader.md` 创建 `mcp_server/` 目录及脚本
4. 环境变量 `ZHIPUAI_API_KEY` 已设置（智谱 API Key，写入项目根目录 `.env` 文件）

### 使用方式

在 OpenCode 中直接调用工具名称即可：

```
请用 read_image 解析 C:\path\to\screenshot.png，描述图片内容
```

```
请用 read_pdf 读取 C:\path\to\report.pdf，use_vision=true，然后总结
```

```
请用 read_docx 读取 C:\path\to\document.docx，提取文本并翻译成中文
```

### 启用 MCP

编辑项目根目录 `opencode.json`，将 `mcp.file-reader.enabled` 改为 `true`:

```json
{
  "mcp": {
    "file-reader": {
      "enabled": true
    }
  }
}
```

### 环境变量

API Key 存储在项目根目录 `.env` 文件（已加入 `.gitignore`，不会提交到 Git）：

```
ZHIPUAI_API_KEY=你的真实Key
```

### 安全提醒

- `.env` 文件已在 `.gitignore` 中排除，不会被提交
- 所有 `edit` 和 `bash` 操作均需要确认（`opencode.json` 中 `permission` 设置）
- MCP 默认 `enabled: false`，需手动改为 `true` 后才生效
