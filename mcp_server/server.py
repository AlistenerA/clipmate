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
from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)

from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types
from PIL import Image
from zhipuai import ZhipuAI

api_key = os.environ.get("ZHIPUAI_API_KEY")
if not api_key:
    raise RuntimeError("ZHIPUAI_API_KEY environment variable is not set")

client = ZhipuAI(api_key=api_key)

server = Server("file-reader")


def image_to_base64_url(image_path: str) -> str:
    path = Path(image_path)
    ext = path.suffix.lower().lstrip(".")
    mime_map = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png",
                "webp": "webp", "gif": "gif", "bmp": "bmp"}
    mime = mime_map.get(ext, "jpeg")
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{mime};base64,{b64}"


def call_glm_vision(image_paths: list[str], prompt: str) -> str:
    content = []
    for p in image_paths:
        content.append({
            "type": "image_url",
            "image_url": {"url": image_to_base64_url(p)}
        })
    content.append({"type": "text", "text": prompt})

    response = client.chat.completions.create(
        model="glm-4.6v",
        messages=[{"role": "user", "content": content}],
        max_tokens=4096,
        temperature=0.1,
    )
    return response.choices[0].message.content or ""


@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="read_image",
            description=(
                "【必须使用】读取和分析图片文件（.png / .jpg / .jpeg / .webp / .gif / .bmp）。"
                "当需要查看、识别、描述、分析图片内容时，必须调用本工具。"
                "因为 deepseek-v4-pro 等模型无法直接处理图片输入，"
                "本工具会通过视觉模型将图片转为文字描述后返回。"
                "参数 file_path 为图片文件的绝对路径。"
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
                        "description": "是否使用 GLM-4V 视觉理解",
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
