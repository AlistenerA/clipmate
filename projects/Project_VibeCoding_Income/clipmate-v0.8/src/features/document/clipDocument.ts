import { isKnownVideoUrl } from '../../shared/media/videoUrl'
import type { UnknownResourceDiagnostic } from './tutorialDiagnostics'

export type ClipDocumentBlock =
  | ClipHeadingBlock
  | ClipParagraphBlock
  | ClipListBlock
  | ClipCodeBlock
  | ClipFormulaBlock
  | ClipTableBlock
  | ClipCalloutBlock
  | ClipFigureBlock
  | ClipVideoBlock
  | ClipDividerBlock

export interface ClipHeadingBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
}

export interface ClipParagraphBlock {
  type: 'paragraph'
  markdown: string
}

export interface ClipListBlock {
  type: 'list'
  ordered: boolean
  items: string[]
}

export interface ClipCodeBlock {
  type: 'code'
  language?: string
  code: string
}

export interface ClipFormulaBlock {
  type: 'formula'
  expression: string
  display: boolean
}

export interface ClipTableBlock {
  type: 'table'
  header: string[]
  rows: string[][]
}

export interface ClipCalloutBlock {
  type: 'callout'
  kind: 'note' | 'tip' | 'warning' | 'important' | 'quote'
  markdown: string
}

export interface ClipFigureBlock {
  type: 'figure'
  url: string
  alt: string
  caption?: string
}

export interface ClipVideoBlock {
  type: 'video'
  url: string
  title?: string
  provider?: string
  source: 'video' | 'source' | 'iframe' | 'markdown'
}

export interface ClipDividerBlock {
  type: 'divider'
}

export interface ClipVideoLinkInput {
  url: string
  title?: string
  provider?: string
  source: ClipVideoBlock['source']
}

export interface ClipDocument {
  schemaVersion: 1
  mode: 'tutorial'
  title: string
  url: string
  sourceMarkdown: string
  blocks: ClipDocumentBlock[]
  diagnostics?: {
    unknownResources: UnknownResourceDiagnostic[]
  }
  stats: {
    headingCount: number
    listCount: number
    codeBlockCount: number
    formulaCount: number
    tableCount: number
    calloutCount: number
    figureCount: number
    videoCount: number
  }
}

export interface CreateClipDocumentInput {
  title: string
  url: string
  markdown: string
  videoLinks?: ClipVideoLinkInput[]
  unknownResources?: UnknownResourceDiagnostic[]
}

const IMAGE_RE = /^!\[([^\]]*)\]\((.+)\)\s*$/
const CAPTION_RE = /^\*([^*]+)\*\s*$/
const VIDEO_LINK_RE = /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*$/i

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.includes('|') && trimmed.includes('-') && trimmed.replace(/[|\s\-:]/g, '') === ''
}

function parseTableRow(line: string): string[] {
  let value = line.trim()
  if (value.startsWith('|')) value = value.slice(1)
  if (value.endsWith('|')) value = value.slice(0, -1)
  return value.split('|').map((cell) => cell.trim())
}

function isDividerLine(line: string): boolean {
  const trimmed = line.trim()
  return /^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed) ||
    /^(?:-\s*){3,}$/.test(trimmed) ||
    /^(?:\*\s*){3,}$/.test(trimmed) ||
    /^(?:_\s*){3,}$/.test(trimmed)
}

function normalizeCalloutKind(value: string): ClipCalloutBlock['kind'] {
  switch (value.toLowerCase()) {
    case 'note':
      return 'note'
    case 'tip':
      return 'tip'
    case 'warning':
    case 'caution':
      return 'warning'
    case 'important':
      return 'important'
    default:
      return 'quote'
  }
}

function normalizeVideoLink(link: ClipVideoLinkInput): ClipVideoLinkInput | null {
  try {
    const url = new URL(link.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return {
      ...link,
      url: url.toString(),
      title: link.title?.trim() || undefined,
      provider: link.provider?.trim() || undefined,
    }
  } catch {
    return null
  }
}

export function parseMarkdownBlocks(markdown: string): ClipDocumentBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ClipDocumentBlock[] = []
  let paragraph: string[] = []
  let index = 0

  const flushParagraph = () => {
    const value = paragraph.join('\n').trim()
    if (value) blocks.push({ type: 'paragraph', markdown: value })
    paragraph = []
  }

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph()
      index++
      continue
    }

    const fence = /^\s*```([^`]*)$/.exec(line)
    if (fence) {
      flushParagraph()
      const code: string[] = []
      index++
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        code.push(lines[index])
        index++
      }
      if (index < lines.length) index++
      blocks.push({
        type: 'code',
        language: fence[1].trim() || undefined,
        code: code.join('\n'),
      })
      continue
    }

    if (trimmed === '$$' || trimmed.startsWith('$$')) {
      flushParagraph()
      if (trimmed.length > 4 && trimmed.endsWith('$$')) {
        blocks.push({ type: 'formula', expression: trimmed.slice(2, -2).trim(), display: true })
        index++
        continue
      }

      const formula: string[] = []
      const openingRemainder = trimmed.slice(2).trim()
      if (openingRemainder) formula.push(openingRemainder)
      index++
      while (index < lines.length) {
        const formulaLine = lines[index]
        const closingIndex = formulaLine.indexOf('$$')
        if (closingIndex >= 0) {
          formula.push(formulaLine.slice(0, closingIndex))
          index++
          break
        }
        formula.push(formulaLine)
        index++
      }
      blocks.push({ type: 'formula', expression: formula.join('\n').trim(), display: true })
      continue
    }

    const inlineFormula = /^\$([^$\n]+)\$$/.exec(trimmed)
    if (inlineFormula) {
      flushParagraph()
      blocks.push({ type: 'formula', expression: inlineFormula[1].trim(), display: false })
      index++
      continue
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    if (heading) {
      flushParagraph()
      blocks.push({
        type: 'heading',
        level: heading[1].length as ClipHeadingBlock['level'],
        text: heading[2].trim(),
      })
      index++
      continue
    }

    if (isDividerLine(trimmed)) {
      flushParagraph()
      blocks.push({ type: 'divider' })
      index++
      continue
    }

    const listItem = /^(?:[-*+]\s+|\d+\.\s+)(.+)$/.exec(line)
    if (listItem) {
      flushParagraph()
      const ordered = /^\d+\./.test(line)
      const items: string[] = []
      while (index < lines.length) {
        const itemLine = lines[index]
        const itemMatch = ordered
          ? /^\d+\.\s+(.+)$/.exec(itemLine)
          : /^[-*+]\s+(.+)$/.exec(itemLine)
        if (!itemMatch) break
        items.push(itemMatch[1].trim())
        index++
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      flushParagraph()
      const header = parseTableRow(line)
      const rows: string[][] = []
      index += 2
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(parseTableRow(lines[index]))
        index++
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }

    if (line.trimStart().startsWith('>')) {
      flushParagraph()
      const quoteLines: string[] = []
      while (index < lines.length && lines[index].trimStart().startsWith('>')) {
        quoteLines.push(lines[index].trimStart().slice(1).replace(/^ /, ''))
        index++
      }
      const marker = /^\[!([A-Za-z]+)\]\s*/.exec(quoteLines[0] || '')
      if (marker) quoteLines[0] = quoteLines[0].slice(marker[0].length)
      blocks.push({
        type: 'callout',
        kind: normalizeCalloutKind(marker?.[1] || ''),
        markdown: quoteLines.join('\n').trim(),
      })
      continue
    }

    const image = IMAGE_RE.exec(trimmed)
    if (image) {
      flushParagraph()
      let captionIndex = index + 1
      while (captionIndex < lines.length && !lines[captionIndex].trim()) captionIndex++
      const caption = CAPTION_RE.exec(lines[captionIndex]?.trim() || '')
      blocks.push({
        type: 'figure',
        alt: image[1].trim(),
        url: image[2].trim(),
        caption: caption?.[1].trim() || undefined,
      })
      index = caption ? captionIndex + 1 : index + 1
      continue
    }

    const videoLink = VIDEO_LINK_RE.exec(trimmed)
    if (videoLink && (/video/i.test(videoLink[1]) || isKnownVideoUrl(videoLink[2]))) {
      flushParagraph()
      blocks.push({
        type: 'video',
        title: videoLink[1].trim(),
        url: videoLink[2].trim(),
        source: 'markdown',
      })
      index++
      continue
    }

    paragraph.push(line)
    index++
  }

  flushParagraph()
  return blocks
}

export function createClipDocument(input: CreateClipDocumentInput): ClipDocument {
  const blocks = parseMarkdownBlocks(input.markdown)
  const seenVideos = new Set(
    blocks.filter((block): block is ClipVideoBlock => block.type === 'video').map((block) => block.url),
  )

  for (const rawLink of input.videoLinks || []) {
    const link = normalizeVideoLink(rawLink)
    if (!link || seenVideos.has(link.url)) continue
    seenVideos.add(link.url)
    blocks.push({ type: 'video', ...link })
  }

  const count = (type: ClipDocumentBlock['type']) => blocks.filter((block) => block.type === type).length

  return {
    schemaVersion: 1,
    mode: 'tutorial',
    title: input.title,
    url: input.url,
    sourceMarkdown: input.markdown,
    blocks,
    diagnostics: input.unknownResources?.length
      ? { unknownResources: input.unknownResources }
      : undefined,
    stats: {
      headingCount: count('heading'),
      listCount: count('list'),
      codeBlockCount: count('code'),
      formulaCount: count('formula'),
      tableCount: count('table'),
      calloutCount: count('callout'),
      figureCount: count('figure'),
      videoCount: count('video'),
    },
  }
}

export function appendVideoLinkMetadata(
  markdown: string,
  videoLinks: ClipVideoLinkInput[],
): string {
  const normalized = videoLinks
    .map(normalizeVideoLink)
    .filter((link): link is ClipVideoLinkInput => Boolean(link))
    .filter((link, index, links) => links.findIndex((candidate) => candidate.url === link.url) === index)
    .filter((link) => !markdown.includes(link.url))

  if (normalized.length === 0) return markdown

  const lines = normalized.map((link) => {
    const label = (link.title || link.provider || 'Video link')
      .replace(/[[\]\r\n]+/g, ' ')
      .trim()
    return `[${label}](${link.url})`
  })

  return `${markdown.trimEnd()}\n\n## Video links\n\n${lines.join('\n\n')}`.trim()
}
