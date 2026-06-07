"""
read_file.py — 独立 CLI 工具，桥接智谱 GLM-4V / GLM-4 API
当 MCP server 不可用时，Agent 可通过 bash 调用本脚本来读取文件

用法:
  python read_file.py image   <文件路径>
  python read_file.py pdf     <文件路径> [--vision]
  python read_file.py docx    <文件路径>
"""
import argparse
import base64
import io
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)

from zhipuai import ZhipuAI

api_key = os.environ.get("ZHIPUAI_API_KEY")
if not api_key:
    print("ERROR: ZHIPUAI_API_KEY not found in .env", file=sys.stderr)
    sys.exit(1)

client = ZhipuAI(api_key=api_key)

SUPPORTED_IMG = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}


def image_to_base64_url(image_path: str) -> str:
    path = Path(image_path)
    ext = path.suffix.lower().lstrip(".")
    mime_map = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png",
                "webp": "webp", "gif": "gif", "bmp": "bmp"}
    mime = mime_map.get(ext, "jpeg")
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{mime};base64,{b64}"


def read_image(file_path: str) -> str:
    p = Path(file_path)
    if not p.exists():
        return f"ERROR: File not found: {file_path}"
    if p.suffix.lower() not in SUPPORTED_IMG:
        return f"ERROR: Unsupported format: {p.suffix}"

    url = image_to_base64_url(str(p))
    response = client.chat.completions.create(
        model="glm-4.6v",
        messages=[{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": url}},
            {"type": "text", "text": (
                "请详细描述这张图片的所有内容，"
                "包括文字、数字、图表、布局结构等。"
                "如果有表格，以 Markdown 格式输出。"
                "逐字提取所有可见文字，不要遗漏。"
            )}
        ]}],
        max_tokens=4096,
        temperature=0.1,
    )
    return response.choices[0].message.content or "(no content)"


def read_pdf(file_path: str, use_vision: bool = False, page_range: str = "all") -> str:
    p = Path(file_path)
    if not p.exists():
        return f"ERROR: File not found: {file_path}"

    try:
        import pdfplumber
    except ImportError:
        return "ERROR: pdfplumber not installed"

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
                    text = read_image(str(tmp_path))
                    results.append(f"=== Page {i + 1}/{total} ===\n{text}")
                finally:
                    tmp_path.unlink(missing_ok=True)
        else:
            for i in indices:
                text = pdf.pages[i].extract_text()
                if text and text.strip():
                    results.append(f"=== Page {i + 1}/{total} ===\n{text}")
                else:
                    results.append(f"=== Page {i + 1}/{total} ===\n(no extractable text, try --vision)")

    return "\n\n".join(results)


def read_docx(file_path: str) -> str:
    p = Path(file_path)
    if not p.exists():
        return f"ERROR: File not found: {file_path}"

    try:
        import docx
    except ImportError:
        return "ERROR: python-docx not installed"

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

    return "\n\n".join(paragraphs)


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


def main():
    parser = argparse.ArgumentParser(description="Read files via ZhipuAI GLM")
    sub = parser.add_subparsers(dest="command", required=True)

    img = sub.add_parser("image", help="Read an image file")
    img.add_argument("path", help="Image file path")

    pdf = sub.add_parser("pdf", help="Read a PDF file")
    pdf.add_argument("path", help="PDF file path")
    pdf.add_argument("--vision", action="store_true", help="Use GLM-4V vision for scanned PDFs")

    docx = sub.add_parser("docx", help="Read a DOCX file")
    docx.add_argument("path", help="DOCX file path")

    args = parser.parse_args()

    if args.command == "image":
        result = read_image(args.path)
    elif args.command == "pdf":
        result = read_pdf(args.path, use_vision=args.vision)
    elif args.command == "docx":
        result = read_docx(args.path)
    else:
        result = f"Unknown command: {args.command}"

    sys.stdout.reconfigure(encoding="utf-8")
    print(result)


if __name__ == "__main__":
    main()
