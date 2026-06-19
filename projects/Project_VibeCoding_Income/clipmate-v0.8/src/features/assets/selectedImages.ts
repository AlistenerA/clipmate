import type { ExtractedContent, SelectedImageAsset } from '../../shared/types/clip.types'

export const ASSET_PICKER_MAX_SELECTION = 20

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/gi

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function escapeMarkdownLabel(value: string): string {
  return value
    .replace(/[[\]\\]/g, '\\$&')
    .replace(/[\r\n]+/g, ' ')
    .trim()
}

function createSelectedImageId(url: string): string {
  let hash = 0
  for (let index = 0; index < url.length; index++) {
    hash = ((hash << 5) - hash + url.charCodeAt(index)) | 0
  }
  return `selected-${Math.abs(hash).toString(36)}`
}

export function normalizeSelectedImages(
  images: SelectedImageAsset[],
  maxSelection = ASSET_PICKER_MAX_SELECTION
): SelectedImageAsset[] {
  const normalized: SelectedImageAsset[] = []
  const seen = new Set<string>()

  for (const image of images) {
    const url = image.url.trim()
    if (!isHttpUrl(url) || seen.has(url) || normalized.length >= maxSelection) continue

    seen.add(url)
    normalized.push({
      ...image,
      id: image.id || createSelectedImageId(url),
      url,
      alt: image.alt?.trim() || undefined,
      title: image.title?.trim() || undefined,
      caption: image.caption?.trim() || undefined,
      index: normalized.length
    })
  }

  return normalized
}

export function getMarkdownImageUrls(markdown: string): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null
  MARKDOWN_IMAGE_RE.lastIndex = 0

  while ((match = MARKDOWN_IMAGE_RE.exec(markdown)) !== null) {
    const url = match[1]
    if (!seen.has(url)) {
      seen.add(url)
      urls.push(url)
    }
  }

  return urls
}

export function formatSelectedImagesMarkdown(
  images: SelectedImageAsset[],
  baseMarkdown = ''
): string {
  const existingUrls = new Set(getMarkdownImageUrls(baseMarkdown))
  const missing = normalizeSelectedImages(images).filter((image) => !existingUrls.has(image.url))
  if (missing.length === 0) return baseMarkdown

  const lines = ['## 已选图片']
  for (const image of missing) {
    const alt = escapeMarkdownLabel(image.alt || image.title || '网页图片')
    lines.push(`![${alt}](${image.url})`)
    const caption =
      image.caption && image.caption !== image.alt ? escapeMarkdownLabel(image.caption) : ''
    if (caption) lines.push(`*${caption}*`)
    lines.push('')
  }

  return [baseMarkdown.trimEnd(), lines.join('\n').trimEnd()].filter(Boolean).join('\n\n')
}

export function applySelectedImagesToContent(
  content: ExtractedContent,
  images: SelectedImageAsset[]
): ExtractedContent {
  const selectedImages = normalizeSelectedImages(images)
  const baseMarkdown = content.assetPickerBaseMarkdown ?? content.markdown
  const markdown = formatSelectedImagesMarkdown(selectedImages, baseMarkdown)
  const markdownImageUrls = getMarkdownImageUrls(markdown)

  return {
    ...content,
    markdown,
    selectedImages,
    assetPickerBaseMarkdown: baseMarkdown,
    imageCount: markdownImageUrls.length,
    firstImageUrl: markdownImageUrls[0] || content.firstImageUrl
  }
}

export function moveSelectedImage(
  images: SelectedImageAsset[],
  fromIndex: number,
  toIndex: number
): SelectedImageAsset[] {
  const normalized = normalizeSelectedImages(images)
  if (
    fromIndex < 0 ||
    fromIndex >= normalized.length ||
    toIndex < 0 ||
    toIndex >= normalized.length ||
    fromIndex === toIndex
  ) {
    return normalized
  }

  const reordered = [...normalized]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  return reordered.map((image, index) => ({ ...image, index }))
}
