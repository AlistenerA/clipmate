# MCP 文件解析器——搭建指南

使用智谱 GLM-4V 视觉模型 + 本地 Python 库，让 OpenCode 具备图片/PDF/Word 文件解析能力。

## 架构

```
用户拖入图片/PDF/DOCX
      │
      ▼
  OpenCode (DeepSeek 推理)
      │
      │ 调用 MCP Tool: read_image / read_pdf / read_docx
      ▼
  ┌─────────────────────────────┐
  │  本地 MCP Server (Python)   │
  │                             │
  │  PDF/DOCX → 本地库提取文本   │
  │  图片/扫描件 → GLM-4V API   │
  └──────────┬──────────────────┘
             │ HTTP (你的 GLM API Key)
             ▼
  ┌─────────────────────┐
  │   智谱 GLM-4V API   │
  │   图片 → 文字描述    │
  └──────────┬──────────┘
             │ 返回文本
             ▼
  OpenCode (DeepSeek) 基于文本做出回答
```

- **PDF/DOCX 文本层**：本地 Python 库提取（隐私、免费、快速）
- **图片/扫描件/图表**：GLM-4V 视觉理解
- **API Key**：环境变量注入，不写入仓库

## 前置条件

### 1. 检查 Python 版本

```powershell
python --version
```

需要 Python 3.10 或更高版本。如果未安装，从 https://www.python.org/downloads/ 下载安装。

### 2. 安装 uv 包管理器

```powershell
pip install uv
```

`uv` 是 Python 的快速包管理器，会自动创建隔离虚拟环境。

### 3. 获取智谱 API Key

1. 访问 https://open.bigmodel.cn/usercenter/apikeys
2. 登录后创建 API Key
3. 将此 API Key 写入项目根目录 `.env` 文件（不要提交到 Git）

```powershell
# 在项目根目录创建 .env 文件
Set-Content -LiteralPath ".env" -Value "ZHIPUAI_API_KEY=你的真实Key"
```

### 4. 确认 .gitignore 已生效

```powershell
git status
```

应该看不到 `.env` 出现在未跟踪文件列表中。

---

## 搭建步骤

### 步骤 1：创建 mcp_server 项目结构

在项目根目录下：

```powershell
New-Item -ItemType Directory -Path "mcp_server"
```

### 步骤 2：创建 pyproject.toml

在 `mcp_server/pyproject.toml` 中写入：

```powershell
@"
[project]
name = "file-reader-mcp"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "mcp>=1.0.0",
    "zhipuai>=2.0.0",
    "pdfplumber>=0.11.0",
    "python-docx>=1.1.0",
    "Pillow>=10.0.0",
]
"@ | Out-File -LiteralPath "mcp_server\pyproject.toml" -Encoding utf8
```

### 步骤 3：创建 server.py

在 `mcp_server/server.py` 中写入以下完整代码：

```python
"""
MCP File Reader Server
桥接智谱 GLM-4V API，提供图片/PDF/Word 文件解析能力
解析结果以纯文本形式返回，供 DeepSeek 等模型使用
"""
import asyncio
import base64
import io
import os
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types
from PIL import Image
from zhipuai import ZhipuAI

# ── 初始化 GLM 客户端 ──────────────────────────────────
api_key = os.environ.get("ZHIPUAI_API_KEY")
if not api_key:
    raise RuntimeError("ZHIPUAI_API_KEY environment variable is not set")

client = ZhipuAI(api_key=api_key)

server = Server("file-reader")


# ── 工具函数 ──────────────────────────────────────────

def image_to_base64_url(image_path: str) -> str:
    """将图片文件转换为 base64 data URL"""
    path = Path(image_path)
    ext = path.suffix.lower().lstrip(".")
    mime_map = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png",
                "webp": "webp", "gif": "gif", "bmp": "bmp"}
    mime = mime_map.get(ext, "jpeg")
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{mime};base64,{b64}"


def call_glm_vision(image_paths: list[str], prompt: str) -> str:
    """调用 GLM-4V API 分析图片"""
    content = []
    for p in image_paths:
        content.append({
            "type": "image_url",
            "image_url": {"url": image_to_base64_url(p)}
        })
    content.append({"type": "text", "text": prompt})

    response = client.chat.completions.create(
        model="glm-4v-flash",
        messages=[{"role": "user", "content": content}],
        max_tokens=4096,
        temperature=0.1,
    )
    return response.choices[0].message.content or ""


# ── MCP Tools ─────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="read_image",
            description=(
                "使用智谱 GLM-4V 视觉模型分析图片文件。"
                "支持 jpg/png/webp/gif/bmp 格式。"
                "返回图片的文字描述、OCR 文字、图表数据等。"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "图片文件的绝对路径"
                    },
                    "prompt": {
                        "type": "string",
                        "description": "可选的提示词",
                        "default": (
                            "请详细描述这张图片的所有内容，"
                            "包括文字、数字、图表、布局结构等。"
                            "如果有表格，以 Markdown 格式输出。"
                        )
                    }
                },
                "required": ["file_path"]
            }
        ),
        types.Tool(
            name="read_pdf",
            description=(
                "读取 PDF 文件。优先使用本地库提取文本；"
                "如果 use_vision=True 则用 GLM-4V 理解扫描件/图表。"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "PDF 文件的绝对路径"
                    },
                    "page_range": {
                        "type": "string",
                        "description": "页面范围，如 '1-3' 或 '1,3,5'，默认 'all'",
                        "default": "all"
                    },
                    "use_vision": {
                        "type": "boolean",
                        "description": "是否使用 GLM-4V 视觉理解（用于扫描件/图表密集的 PDF）",
                        "default": False
                    }
                },
                "required": ["file_path"]
            }
        ),
        types.Tool(
            name="read_docx",
            description="读取 Word (.docx) 文件，提取全部文本内容。",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "DOCX 文件的绝对路径"
                    }
                },
                "required": ["file_path"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    try:
        if name == "read_image":
            return await _handle_read_image(arguments)
        elif name == "read_pdf":
            return await _handle_read_pdf(arguments)
        elif name == "read_docx":
            return await _handle_read_docx(arguments)
        else:
            return [types.TextContent(type="text",
                    text=f"Unknown tool: {name}")]
    except Exception as e:
        return [types.TextContent(type="text",
                text=f"Error: {str(e)}")]


async def _handle_read_image(args: dict) -> list[types.TextContent]:
    file_path = args["file_path"]
    prompt = args.get("prompt",
        "请详细描述这张图片的所有内容，"
        "包括文字、数字、图表、布局结构等。如果有表格，以 Markdown 格式输出。")

    p = Path(file_path)
    if not p.exists():
        return [types.TextContent(type="text",
                text=f"File not found: {file_path}")]

    supported = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
    if p.suffix.lower() not in supported:
        return [types.TextContent(type="text",
                text=f"Unsupported format: {p.suffix}. "
                     f"Supported: {', '.join(sorted(supported))}")]

    result = call_glm_vision([str(p)], prompt)
    return [types.TextContent(type="text", text=result)]


async def _handle_read_pdf(args: dict) -> list[types.TextContent]:
    file_path = args["file_path"]
    page_range = args.get("page_range", "all")
    use_vision = args.get("use_vision", False)

    p = Path(file_path)
    if not p.exists():
        return [types.TextContent(type="text",
                text=f"File not found: {file_path}")]

    import pdfplumber

    with pdfplumber.open(str(p)) as pdf:
        total = len(pdf.pages)
        if page_range == "all":
            indices = list(range(total))
        else:
            indices = _parse_page_range(page_range, total)

        results = []
        if use_vision:
            for i in indices:
                page = pdf.pages[i]
                img = page.to_image(resolution=150)
                buf = io.BytesIO()
                img.save(buf, format="PNG")
                tmp_path = p.parent / f"_page_{i + 1}.png"
                with open(tmp_path, "wb") as f:
                    f.write(buf.getvalue())
                try:
                    text = call_glm_vision(
                        [str(tmp_path)],
                        f"这是 PDF 的第 {i + 1}/{total} 页。"
                        f"请提取并描述本页的全部内容。"
                    )
                    results.append(f"=== Page {i + 1}/{total} ===\n{text}")
                finally:
                    tmp_path.unlink(missing_ok=True)
        else:
            for i in indices:
                text = pdf.pages[i].extract_text()
                if text and text.strip():
                    results.append(f"=== Page {i + 1}/{total} ===\n{text}")
                else:
                    results.append(
                        f"=== Page {i + 1}/{total} ===\n"
                        f"(no extractable text, try use_vision=true)"
                    )

        output = "\n\n".join(results)
        return [types.TextContent(type="text", text=output)]


async def _handle_read_docx(args: dict) -> list[types.TextContent]:
    file_path = args["file_path"]

    p = Path(file_path)
    if not p.exists():
        return [types.TextContent(type="text",
                text=f"File not found: {file_path}")]

    import docx

    doc = docx.Document(str(p))
    paragraphs = []
    for para in doc.paragraphs:
        if para.text.strip():
            paragraphs.append(para.text)

    for table in doc.tables:
        table_text = []
        for row in table.rows:
            cells = [cell.text for cell in row.cells]
            table_text.append(" | ".join(cells))
        paragraphs.append("\n" + "\n".join(table_text) + "\n")

    text = "\n\n".join(paragraphs)
    return [types.TextContent(type="text", text=text)]


def _parse_page_range(text: str, total: int) -> list[int]:
    """解析 '1-3,5,7-9' 为索引列表（0-based）"""
    indices = []
    for part in text.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            start, end = int(a.strip()), int(b.strip())
            for i in range(start, end + 1):
                if 1 <= i <= total:
                    indices.append(i - 1)
        else:
            i = int(part)
            if 1 <= i <= total:
                indices.append(i - 1)
    return sorted(set(indices))


# ── 入口 ──────────────────────────────────────────────

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(
            asyncio.WindowsProactorEventLoopPolicy()
        )
    asyncio.run(main())
```

### 步骤 4：安装依赖

```powershell
# 进入 mcp_server 目录，用 uv 安装依赖
Set-Location -LiteralPath "mcp_server"
uv sync
Set-Location -LiteralPath ".."
```

### 步骤 5：启用 MCP 服务

编辑项目根目录 `opencode.json`，将 `enabled` 从 `false` 改为 `true`：

```json
{
  "mcp": {
    "file-reader": {
      "enabled": true
    }
  }
}
```

### 步骤 6：验证

在 OpenCode 中测试：

```
请用 read_image 解析 C:\path\to\a_test_image.png，描述图片内容
```

---

## 可用工具说明

### read_image

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file_path` | string | 是 | 图片文件的绝对路径 |
| `prompt` | string | 否 | 自定义分析提示词 |

支持格式：jpg, png, webp, gif, bmp

### read_pdf

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file_path` | string | 是 | PDF 文件的绝对路径 |
| `page_range` | string | 否 | 页码范围，如 `"1-3"` 或 `"1,3,5"`，默认 `"all"` |
| `use_vision` | boolean | 否 | 是否使用视觉理解，默认 `false` |

- `use_vision=false`：使用 `pdfplumber` 本地提取文本（免费、快速）
- `use_vision=true`：将每页渲染为图片发给 GLM-4V（适合扫描件、图表密集的 PDF）

### read_docx

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file_path` | string | 是 | DOCX 文件的绝对路径 |

提取 Word 文档中所有段落和表格的文本。

---

## 故障排查

### Q: 提示 "ZHIPUAI_API_KEY environment variable is not set"

确认 `.env` 文件存在且内容正确：

```powershell
Get-Content -LiteralPath ".env"
```

应在项目根目录（与 `opencode.json` 同级）。

### Q: 提示 "uv: command not found"

```powershell
pip install uv
```

### Q: 提示 ModuleNotFoundError: No module named 'xxx'

重新同步依赖：

```powershell
Set-Location -LiteralPath "mcp_server"
uv sync
Set-Location -LiteralPath ".."
```

### Q: MCP server 无响应

检查 `opencode.json` 中 `enabled` 是否为 `true`。

---

## 回退 / 卸载

```powershell
# 1. 禁用 MCP（编辑 opencode.json，enabled: false）

# 2. 完全删除 MCP 相关文件
Remove-Item opencode.json
Remove-Item .gitignore
Remove-Item -Recurse mcp_server

# 3. 删除 .env 文件
Remove-Item .env

# 4. 用 Git 恢复
git checkout main
```

---

## 需要安装的第三方包

| 包名 | 来源 | 用途 | 安装方式 |
|------|------|------|----------|
| `mcp` | PyPI (https://pypi.org/project/mcp/) | MCP Python SDK，实现 MCP 协议通信 | `uv sync` |
| `zhipuai` | PyPI (https://pypi.org/project/zhipuai/) | 智谱官方 Python SDK，调用 GLM-4V API | `uv sync` |
| `pdfplumber` | PyPI (https://pypi.org/project/pdfplumber/) | PDF 文本提取（本地） | `uv sync` |
| `python-docx` | PyPI (https://pypi.org/project/python-docx/) | Word .docx 文本提取（本地） | `uv sync` |
| `Pillow` | PyPI (https://pypi.org/project/Pillow/) | Python 图像处理库 | `uv sync` |
| `uv` | PyPI (https://pypi.org/project/uv/) | Python 包管理器 | `pip install uv` |

这些都是开源、广泛使用的 PyPI 包，`uv sync` 会自动下载到隔离的虚拟环境中。
