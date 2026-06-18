export interface InlineText {
  type: 'text'
  text: string
}

export interface InlineBold {
  type: 'bold'
  text: string
}

export interface InlineItalic {
  type: 'italic'
  text: string
}

export interface InlineCode {
  type: 'code'
  text: string
}

export interface InlineLink {
  type: 'link'
  text: string
  href: string
  safe: boolean
}

export interface InlineImage {
  type: 'image'
  alt: string
  src: string
}

export interface InlineFormula {
  type: 'formula'
  text: string
}

export type InlineSegment =
  | InlineText
  | InlineBold
  | InlineItalic
  | InlineCode
  | InlineLink
  | InlineImage
  | InlineFormula

export interface PreviewHeading {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  segments: InlineSegment[]
}

export interface PreviewParagraph {
  type: 'paragraph'
  segments: InlineSegment[]
}

export interface PreviewBlockquote {
  type: 'blockquote'
  segments: InlineSegment[]
}

export interface PreviewList {
  type: 'list'
  ordered: boolean
  items: InlineSegment[][]
}

export interface PreviewCode {
  type: 'code'
  language?: string
  code: string
}

export interface PreviewTable {
  type: 'table'
  header: string[]
  rows: string[][]
}

export interface PreviewImage {
  type: 'image'
  alt: string
  url: string
  safe: boolean
}

export interface PreviewHr {
  type: 'hr'
}

export type MarkdownPreviewBlock =
  | PreviewHeading
  | PreviewParagraph
  | PreviewBlockquote
  | PreviewList
  | PreviewCode
  | PreviewTable
  | PreviewImage
  | PreviewHr

export function isSafePreviewHref(href: string | undefined | null): boolean {
  if (!href) return false
  const h = href.trim().toLowerCase()
  if (!h) return false
  if (h.startsWith('javascript:') || h.startsWith('data:')) return false
  if (/^void\s*\(/.test(h)) return false
  return true
}

export function isSafePreviewImageSrc(src: string | undefined | null): boolean {
  if (!src) return false
  try {
    const url = new URL(src.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function sanitizePreviewText(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  let i = 0

  while (i < text.length) {
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end !== -1) {
        segments.push({ type: 'code', text: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }

    if (text[i] === '!' && text[i + 1] === '[') {
      const altEnd = findMatchingBracket(text, i + 2, '[', ']')
      if (altEnd !== -1 && text[altEnd + 1] === '(') {
        const urlEnd = text.indexOf(')', altEnd + 2)
        if (urlEnd !== -1) {
          const alt = text.slice(i + 2, altEnd)
          const url = text.slice(altEnd + 2, urlEnd)
          segments.push({ type: 'image', alt, src: url })
          i = urlEnd + 1
          continue
        }
      }
    }

    if (text[i] === '$') {
      const end = text.indexOf('$', i + 1)
      if (end !== -1 && end > i + 1) {
        segments.push({ type: 'formula', text: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }

    if (text[i] === '[') {
      const bracketEnd = findMatchingBracket(text, i + 1, '[', ']')
      if (bracketEnd !== -1 && text[bracketEnd + 1] === '(') {
        const urlEnd = text.indexOf(')', bracketEnd + 2)
        if (urlEnd !== -1) {
          const linkText = text.slice(i + 1, bracketEnd)
          const href = text.slice(bracketEnd + 2, urlEnd)
          const safe = isSafePreviewHref(href)
          segments.push({ type: 'link', text: linkText || href, href, safe })
          i = urlEnd + 1
          continue
        }
      }
    }

    if (
      (text[i] === '*' && text[i + 1] === '*') ||
      (text[i] === '_' && text[i + 1] === '_')
    ) {
      const marker = text[i] + text[i + 1]
      const end = text.indexOf(marker, i + 2)
      if (end !== -1 && end > i + 2) {
        segments.push({ type: 'bold', text: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }

    if (text[i] === '*' || text[i] === '_') {
      const marker = text[i]
      const end = text.indexOf(marker, i + 1)
      if (end !== -1 && end > i + 1) {
        const content = text.slice(i + 1, end)
        if (!content.includes('\n')) {
          segments.push({ type: 'italic', text: content })
          i = end + 1
          continue
        }
      }
    }

    let j = i
    while (j < text.length && '`!$[*_'.indexOf(text[j]) === -1) {
      j++
    }
    if (j > i) {
      segments.push({ type: 'text', text: text.slice(i, j) })
    } else {
      segments.push({ type: 'text', text: text[i] })
      j++
    }
    i = j
  }

  return segments
}

function findMatchingBracket(
  text: string,
  start: number,
  open: string,
  close: string,
): number {
  let depth = 1
  let i = start
  while (i < text.length && depth > 0) {
    if (text[i] === '\\') {
      i += 2
      continue
    }
    if (text[i] === open) depth++
    else if (text[i] === close) depth--
    i++
  }
  return depth === 0 ? i - 1 : -1
}

function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false
  const cleaned = trimmed.replace(/[|\s\-:]/g, '')
  return cleaned === ''
}

function parseTableRow(line: string): string[] {
  let content = line.trim()
  if (content.startsWith('|')) content = content.slice(1)
  if (content.endsWith('|')) content = content.slice(0, -1)
  return content.split('|').map((c) => c.trim())
}

function parseImageLine(line: string): { alt: string; url: string } | null {
  const trimmed = line.trim()
  const match = trimmed.match(/^!\[([^\]]*)\]\((.*)\)$/)
  if (!match) return null
  const url = match[2].trim()
  if (!url) return null
  return { alt: sanitizePreviewText(match[1]), url }
}

function isDividerLine(line: string): boolean {
  const trimmed = line.trim()
  return /^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed) ||
    /^(?:-\s*){3,}$/.test(trimmed) ||
    /^(?:\*\s*){3,}$/.test(trimmed) ||
    /^(?:_\s*){3,}$/.test(trimmed)
}

function collectParagraphLines(
  lines: string[],
  start: number,
): { text: string; next: number } {
  const parts: string[] = []
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') break
    if (line.trimStart().startsWith('```')) break
    if (/^#{1,6}\s/.test(line)) break
    if (isDividerLine(line)) break
    if (line.startsWith('>')) break
    if (/^[-*+]\s/.test(line)) break
    if (/^\d+\.\s/.test(line)) break
    if (line.includes('|') && i + 1 < lines.length && isTableSeparatorRow(lines[i + 1]))
      break
    if (parseImageLine(line)) break
    parts.push(line)
    i++
  }
  return { text: parts.join('\n'), next: i }
}

export function parseMarkdownPreview(markdown: string): MarkdownPreviewBlock[] {
  if (!markdown || !markdown.trim()) return []

  const lines = markdown.split('\n')
  const blocks: MarkdownPreviewBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    const trimmedStart = line.trimStart()

    if (trimmedStart.startsWith('```')) {
      const fenceMarker = trimmedStart
      const lang = fenceMarker.slice(3).trim() || undefined
      const codeLines: string[] = []
      i++
      while (i < lines.length) {
        if (lines[i].trimStart().startsWith('```')) {
          i++
          break
        }
        codeLines.push(lines[i])
        i++
      }
      const code = codeLines.join('\n')
      blocks.push({ type: 'code', language: lang, code })
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 6) as 1 | 2 | 3 | 4 | 5 | 6
      const segments = parseInline(sanitizePreviewText(headingMatch[2]))
      blocks.push({ type: 'heading', level, segments })
      i++
      continue
    }

    if (isDividerLine(line)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    if (line.includes('|') && i + 1 < lines.length && isTableSeparatorRow(lines[i + 1])) {
      const headerCells = parseTableRow(line)
      i += 2 // skip header and separator
      const dataRows: string[][] = []
      while (i < lines.length && lines[i].includes('|')) {
        dataRows.push(parseTableRow(lines[i]))
        i++
      }
      blocks.push({ type: 'table', header: headerCells, rows: dataRows })
      continue
    }

    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        const quoteContent = lines[i].slice(1).replace(/^ /, '')
        quoteLines.push(quoteContent)
        i++
      }
      const quoteText = quoteLines.join('\n')
      const segments = parseInline(sanitizePreviewText(quoteText))
      blocks.push({ type: 'blockquote', segments })
      continue
    }

    const ulMatch = line.match(/^[-*+]\s+(.+)/)
    if (ulMatch) {
      const items: InlineSegment[][] = []
      while (i < lines.length) {
        const m = lines[i].match(/^[-*+]\s+(.+)/)
        if (!m) break
        items.push(parseInline(sanitizePreviewText(m[1])))
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    const olMatch = line.match(/^\d+\.\s+(.+)/)
    if (olMatch) {
      const items: InlineSegment[][] = []
      while (i < lines.length) {
        const m = lines[i].match(/^\d+\.\s+(.+)/)
        if (!m) break
        items.push(parseInline(sanitizePreviewText(m[1])))
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    const image = parseImageLine(line.trim())
    if (image) {
      blocks.push({
        type: 'image',
        alt: image.alt,
        url: image.url,
        safe: isSafePreviewImageSrc(image.url),
      })
      i++
      continue
    }

    const { text: paraText, next } = collectParagraphLines(lines, i)

    if (next <= i) {
      const fallbackText = sanitizePreviewText(line.trim())
      if (fallbackText) {
        blocks.push({
          type: 'paragraph',
          segments: parseInline(fallbackText),
        })
      }
      i++
      continue
    }

    if (paraText) {
      const segments = parseInline(sanitizePreviewText(paraText))
      blocks.push({ type: 'paragraph', segments })
    }
    i = next
  }

  return blocks
}
