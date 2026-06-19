import type { ClipDraft } from '../../shared/types/clip.types'
import type { ClipDocument, ClipDocumentBlock } from '../../features/document'
import { parseNotionRichText } from './notionRichText'
import { isNotionEmbeddableVideoUrl } from '../../shared/media/videoUrl'

interface BlockObjectRequest {
  object: 'block'
  type: string
  [key: string]: unknown
}

const MAX_TEXT_LENGTH = 2000
const MAX_NESTED_BLOCKS = 100

const IMAGE_MARKDOWN_RE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/

const ITALIC_CAPTION_RE = /^\*([^*]+)\*$/

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= MAX_TEXT_LENGTH) {
      chunks.push(remaining)
      break
    }
    let splitAt = remaining.lastIndexOf('\n', MAX_TEXT_LENGTH)
    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf(' ', MAX_TEXT_LENGTH)
    }
    if (splitAt <= 0) {
      splitAt = MAX_TEXT_LENGTH
    }
    chunks.push(remaining.substring(0, splitAt))
    remaining = remaining.substring(splitAt).replace(/^\s+/, '')
  }
  return chunks
}

function richText(content: string) {
  return parseNotionRichText(content)
}

function paragraphBlock(text: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: richText(text) }
  }
}

function textBlocks(
  text: string,
  create: (chunk: string) => BlockObjectRequest
): BlockObjectRequest[] {
  return chunkText(text).map(create)
}

function splitParagraphs(contentText: string): string[] {
  return contentText
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\n/g, ' '))
    .filter((p) => p.length > 0)
}

function isValidExternalImageUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (!/^https?:\/\//.test(trimmed)) return false
  if (trimmed.length > MAX_TEXT_LENGTH) return false
  return true
}

const NON_DIRECT_IMAGE_HOST_PATTERNS = [
  /\/api\/auto\/resize\b/i,
  /\/api\/[^/]*\.(?:jpg|png|gif|webp)/i,
  /\/(?:resize|crop|thumbnail|thumb)\b/i,
  /[?&]img=(?:https?:\/\/|[^&]*\/)/i
]

function isLikelyDirectImageHosting(url: string): boolean {
  const path = (() => {
    try {
      const u = new URL(url)
      return u.pathname + u.search
    } catch {
      return url
    }
  })()

  for (const pattern of NON_DIRECT_IMAGE_HOST_PATTERNS) {
    if (pattern.test(path)) return false
  }

  return true
}

function tryImageBlock(rawUrl: string, alt: string): BlockObjectRequest | null {
  const url = rawUrl.trim()
  if (!isValidExternalImageUrl(url)) return null
  if (!isLikelyDirectImageHosting(url)) return null

  try {
    const captionText = alt.trim()
    return {
      object: 'block',
      type: 'image',
      image: {
        type: 'external',
        external: { url },
        caption: captionText ? richText(captionText) : []
      }
    }
  } catch {
    return null
  }
}

function normalizeCodeLanguage(language?: string): string {
  if (!language) return 'plain text'
  const value = language.trim().toLowerCase()
  const aliases: Record<string, string> = {
    csharp: 'c#',
    cs: 'c#',
    cpp: 'c++',
    html: 'html',
    js: 'javascript',
    jsx: 'javascript',
    md: 'markdown',
    py: 'python',
    shell: 'shell',
    sh: 'shell',
    ts: 'typescript',
    tsx: 'typescript',
    text: 'plain text'
  }
  const supported = new Set([
    'abap',
    'arduino',
    'bash',
    'basic',
    'c',
    'c#',
    'c++',
    'clojure',
    'coffeescript',
    'css',
    'dart',
    'diff',
    'docker',
    'elixir',
    'elm',
    'erlang',
    'flow',
    'fortran',
    'f#',
    'gherkin',
    'glsl',
    'go',
    'graphql',
    'groovy',
    'haskell',
    'html',
    'java',
    'javascript',
    'json',
    'julia',
    'kotlin',
    'latex',
    'less',
    'lisp',
    'lua',
    'makefile',
    'markdown',
    'markup',
    'matlab',
    'mermaid',
    'nix',
    'objective-c',
    'ocaml',
    'pascal',
    'perl',
    'php',
    'plain text',
    'powershell',
    'prolog',
    'protobuf',
    'python',
    'r',
    'reason',
    'ruby',
    'rust',
    'sass',
    'scala',
    'scheme',
    'scss',
    'shell',
    'sql',
    'swift',
    'typescript',
    'vb.net',
    'verilog',
    'vhdl',
    'visual basic',
    'webassembly',
    'xml',
    'yaml'
  ])
  const normalized = aliases[value] || value
  return supported.has(normalized) ? normalized : 'plain text'
}

function calloutIcon(kind: Extract<ClipDocumentBlock, { type: 'callout' }>['kind']): string {
  switch (kind) {
    case 'tip':
      return '💡'
    case 'warning':
      return '⚠️'
    case 'important':
      return '❗'
    case 'note':
      return '📝'
    default:
      return '💬'
  }
}

function tutorialTableBlocks(
  block: Extract<ClipDocumentBlock, { type: 'table' }>
): BlockObjectRequest[] {
  const width = Math.max(block.header.length, ...block.rows.map((row) => row.length), 0)
  if (width === 0) return []

  const makeRow = (row: string[]) => ({
    object: 'block',
    type: 'table_row',
    table_row: {
      cells: Array.from({ length: width }, (_, index) =>
        chunkText(row[index] || '').flatMap(richText)
      )
    }
  })

  const hasHeader = block.header.length > 0
  const dataRowsPerTable = hasHeader ? MAX_NESTED_BLOCKS - 1 : MAX_NESTED_BLOCKS
  const rowGroups =
    block.rows.length > 0
      ? Array.from({ length: Math.ceil(block.rows.length / dataRowsPerTable) }, (_, index) =>
          block.rows.slice(index * dataRowsPerTable, (index + 1) * dataRowsPerTable)
        )
      : [[]]

  return rowGroups.map((rows) => ({
    object: 'block',
    type: 'table',
    table: {
      table_width: width,
      has_column_header: hasHeader,
      has_row_header: false,
      children: [...(hasHeader ? [makeRow(block.header)] : []), ...rows.map(makeRow)]
    }
  }))
}

function tutorialBlockToNotion(block: ClipDocumentBlock): BlockObjectRequest[] {
  switch (block.type) {
    case 'heading': {
      const level = Math.min(block.level, 3)
      const type = `heading_${level}`
      return textBlocks(block.text, (chunk) => ({
        object: 'block',
        type,
        [type]: { rich_text: richText(chunk) }
      }))
    }
    case 'paragraph':
      return textBlocks(block.markdown, paragraphBlock)
    case 'list': {
      const type = block.ordered ? 'numbered_list_item' : 'bulleted_list_item'
      return block.items.flatMap((item) =>
        textBlocks(item, (chunk) => ({
          object: 'block',
          type,
          [type]: { rich_text: richText(chunk) }
        }))
      )
    }
    case 'code':
      return textBlocks(block.code, (chunk) => ({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: chunk } }],
          language: normalizeCodeLanguage(block.language)
        }
      }))
    case 'formula':
      if (!block.expression.trim() || block.expression.length > 1000) {
        return textBlocks(`$$\n${block.expression}\n$$`, paragraphBlock)
      }
      return [
        {
          object: 'block',
          type: 'equation',
          equation: { expression: block.expression }
        }
      ]
    case 'table':
      return tutorialTableBlocks(block)
    case 'callout':
      return textBlocks(block.markdown, (chunk) => ({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: richText(chunk),
          icon: { emoji: calloutIcon(block.kind) }
        }
      }))
    case 'figure': {
      const image = tryImageBlock(block.url, block.caption || '')
      return image ? [image] : [paragraphBlock(`![${block.alt}](${block.url})`)]
    }
    case 'video':
      if (!isValidExternalImageUrl(block.url)) return [paragraphBlock(block.url)]
      if (isNotionEmbeddableVideoUrl(block.url)) {
        return [
          {
            object: 'block',
            type: 'video',
            video: {
              type: 'external',
              external: { url: block.url },
              caption: block.title ? richText(block.title) : []
            }
          }
        ]
      }
      return [
        {
          object: 'block',
          type: 'bookmark',
          bookmark: {
            url: block.url,
            caption: block.title ? richText(block.title) : []
          }
        }
      ]
    case 'divider':
      return [{ object: 'block', type: 'divider', divider: {} }]
    default:
      return []
  }
}

export function clipDocumentToNotionBlocks(document: ClipDocument): BlockObjectRequest[] {
  return document.blocks.flatMap(tutorialBlockToNotion)
}

function modeLabel(mode: ClipDraft['mode']): string {
  if (mode === 'selection') return '选区'
  if (mode === 'tutorial') return '教程'
  return '全文'
}

function formatMetadataTime(value?: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 32)
  return date.toISOString().slice(0, 16).replace('T', ' ')
}

function metadataHeaderBlock(draft: ClipDraft): BlockObjectRequest {
  const meta = draft.content.metadata
  const rows: string[] = []
  if (meta.siteName) rows.push(`站点：${meta.siteName}`)
  if (meta.author) rows.push(`作者：${meta.author}`)
  const publishedAt = formatMetadataTime(meta.publishedAt)
  if (publishedAt) rows.push(`发布：${publishedAt}`)
  rows.push(`模式：${modeLabel(draft.mode)}`)
  const clippedAt = formatMetadataTime(meta.createdAt)
  if (clippedAt) rows.push(`剪藏：${clippedAt}`)
  if (draft.tags.length > 0) rows.push(`标签：${draft.tags.map((tag) => `#${tag}`).join(' ')}`)

  const url = draft.content.url?.trim()
  const headerRichText: ReturnType<typeof richText> = []
  if (url && /^https?:\/\//i.test(url)) {
    let label = url
    try {
      label = new URL(url).hostname || url
    } catch {
      label = url
    }
    headerRichText.push(...richText('来源：'))
    headerRichText.push({
      type: 'text',
      text: { content: label.slice(0, MAX_TEXT_LENGTH), link: { url } },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default'
      }
    })
    if (rows.length > 0) headerRichText.push(...richText('\n'))
  }
  if (rows.length > 0) headerRichText.push(...richText(rows.join('\n')))

  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: headerRichText,
      icon: { emoji: '🔖' },
      color: 'gray_background'
    }
  }
}

export function markdownToContentBlocks(contentText: string): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = []
  const paragraphs = splitParagraphs(contentText)

  for (let i = 0; i < paragraphs.length; i++) {
    const trimmed = paragraphs[i].trim()
    const imageMatch = IMAGE_MARKDOWN_RE.exec(trimmed)

    if (imageMatch) {
      const alt = imageMatch[1] || ''
      const rawUrl = imageMatch[2] || ''
      let caption = alt.trim()

      if (i + 1 < paragraphs.length) {
        const nextTrimmed = paragraphs[i + 1].trim()
        const captionMatch = ITALIC_CAPTION_RE.exec(nextTrimmed)
        if (captionMatch) {
          const captionText = captionMatch[1].trim()
          if (captionText.length <= 200) {
            caption = captionText
            i++
          }
        }
      }

      const imageBlock = tryImageBlock(rawUrl, caption)
      if (imageBlock) {
        blocks.push(imageBlock)
        continue
      }
    }

    if (trimmed.length <= MAX_TEXT_LENGTH) {
      blocks.push(paragraphBlock(trimmed))
    } else {
      const chunks = chunkText(trimmed)
      for (const chunk of chunks) {
        blocks.push(paragraphBlock(chunk))
      }
    }
  }

  return blocks
}

export function buildNotionBlocks(draft: ClipDraft): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = []

  if (draft.content?.clipMode === 'comment-context') {
    const contentText = draft.content?.markdown || draft.content?.contentText || ''
    if (contentText.trim()) {
      blocks.push(...markdownToContentBlocks(contentText.trim()))
    }
    return blocks
  }

  const title = (draft.title || draft.content?.title || '未命名剪藏').slice(0, MAX_TEXT_LENGTH)
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: richText(title) }
  })

  blocks.push(metadataHeaderBlock(draft))

  const noteText = draft.note.trim()
  if (noteText) {
    if (noteText.length <= MAX_TEXT_LENGTH) {
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: richText(noteText),
          icon: { emoji: '📝' }
        }
      })
    } else {
      const noteChunks = chunkText(noteText)
      for (const chunk of noteChunks) {
        blocks.push({
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: richText(chunk),
            icon: { emoji: '📝' }
          }
        })
      }
    }
  }

  blocks.push({
    object: 'block',
    type: 'divider',
    divider: {}
  })

  if (draft.mode === 'selection') {
    blocks.push({
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: richText('注：以下内容为网页选区摘录，并非全文。'),
        icon: { emoji: '📋' }
      }
    })
  }

  const contentText = draft.content?.markdown || draft.content?.contentText || ''
  if (contentText.trim()) {
    if (draft.mode === 'tutorial' && draft.content?.clipDocument) {
      blocks.push(...clipDocumentToNotionBlocks(draft.content.clipDocument))
      const documentImageUrls = new Set(
        draft.content.clipDocument.blocks
          .filter(
            (block): block is Extract<ClipDocumentBlock, { type: 'figure' }> =>
              block.type === 'figure'
          )
          .map((block) => block.url)
      )
      for (const selected of draft.content.selectedImages || []) {
        if (documentImageUrls.has(selected.url)) continue
        const imageBlock = tryImageBlock(selected.url, selected.caption || selected.alt || '')
        blocks.push(
          imageBlock || paragraphBlock(`![${selected.alt || '网页图片'}](${selected.url})`)
        )
      }
    } else {
      blocks.push(...markdownToContentBlocks(contentText.trim()))
    }
  }

  return blocks
}
