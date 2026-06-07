"""
公共模块：提供 base64 编码、GLM API 调用、PDF 页范围解析等共享功能
供 server.py (MCP) 和 read_file.py (CLI) 共同使用
"""
import base64
import io
import logging
import os
import tempfile
import time
from pathlib import Path

from dotenv import load_dotenv
from zhipuai import ZhipuAI

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)

logger = logging.getLogger("file-reader")

SUPPORTED_IMG = frozenset({".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"})

MIME_MAP = {
    "jpg": "jpeg", "jpeg": "jpeg", "png": "png",
    "webp": "webp", "gif": "gif", "bmp": "bmp",
}

DEFAULT_VISION_PROMPT = (
    "请详细描述这张图片的所有内容，"
    "包括文字、数字、图表、布局结构等。"
    "如果有表格，以 Markdown 格式输出。"
)

api_key = os.environ.get("ZHIPUAI_API_KEY")
if not api_key:
    raise RuntimeError("ZHIPUAI_API_KEY environment variable is not set")

_client: ZhipuAI | None = None


def get_client() -> ZhipuAI:
    global _client
    if _client is None:
        _client = ZhipuAI(api_key=api_key)
    return _client


def validate_image_path(file_path: str | Path) -> Path:
    p = Path(file_path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    if p.suffix.lower() not in SUPPORTED_IMG:
        raise ValueError(
            f"Unsupported format: {p.suffix}. Supported: {', '.join(sorted(SUPPORTED_IMG))}"
        )
    return p


def image_to_base64_url(image_path: str | Path) -> str:
    path = Path(image_path)
    ext = path.suffix.lower().lstrip(".")
    mime = MIME_MAP.get(ext, "jpeg")
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{mime};base64,{b64}"


def call_glm_vision(
    image_paths: list[str],
    prompt: str = DEFAULT_VISION_PROMPT,
    *,
    max_retries: int = 2,
) -> str:
    client = get_client()
    content = []
    for p in image_paths:
        content.append({
            "type": "image_url",
            "image_url": {"url": image_to_base64_url(p)}
        })
    content.append({"type": "text", "text": prompt})

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            response = client.chat.completions.create(
                model="glm-4.6v",
                messages=[{"role": "user", "content": content}],
                max_tokens=4096,
                temperature=0.1,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            last_error = e
            logger.warning("GLM API call failed (attempt %d/%d): %s", attempt + 1, max_retries + 1, e)
            if attempt < max_retries:
                time.sleep(1 * (2 ** attempt))
    raise last_error  # type: ignore[misc]


def pdf_page_to_vision_text(
    pdf,
    page_index: int,
    total_pages: int,
    output_dir: str | None = None,
) -> str:
    page = pdf.pages[page_index]
    img = page.to_image(resolution=150)
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    if output_dir is None:
        output_dir = tempfile.gettempdir()

    tmp = tempfile.NamedTemporaryFile(
        suffix=".png", prefix=f"pdf_page_{page_index + 1}_",
        dir=output_dir, delete=False,
    )
    try:
        tmp.write(buf.getvalue())
        tmp.close()
        text = call_glm_vision(
            [tmp.name],
            f"这是 PDF 的第 {page_index + 1}/{total_pages} 页。请提取并描述本页的全部内容。"
        )
        return f"=== Page {page_index + 1}/{total_pages} ===\n{text}"
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


def parse_page_range(text: str, total: int) -> list[int]:
    indices: list[int] = []
    for part in text.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a_str, b_str = part.split("-", 1)
            try:
                start = int(a_str.strip())
                end = int(b_str.strip())
            except ValueError:
                raise ValueError(f"Invalid page range: '{part}'")
            if start > end:
                start, end = end, start
            for i in range(start, end + 1):
                if 1 <= i <= total:
                    indices.append(i - 1)
        else:
            try:
                i = int(part)
            except ValueError:
                raise ValueError(f"Invalid page number: '{part}'")
            if 1 <= i <= total:
                indices.append(i - 1)
    return sorted(set(indices))
