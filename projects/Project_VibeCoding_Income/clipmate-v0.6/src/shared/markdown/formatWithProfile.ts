import type { MarkdownTarget } from '../types/clip.types'
import { getMarkdownProfile } from './profiles'
import { cleanMarkdown } from '../utils/formatMarkdown'

export interface FormatMarkdownInput {
  title: string
  url: string
  tags: string[]
  note: string
  bodyMarkdown: string
  createdAt?: string
  mode?: 'fullpage' | 'selection'
  clipMode?: 'comment-context'
}

function escapeYamlValue(value: string): string {
  if (/["':{}[\],&*#?|!%@`\-<>=]/.test(value) || value.includes('\n')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
  }
  return value
}

function buildYamlFrontmatter(
  title: string,
  url: string,
  tags: string[],
  createdAt: string,
): string {
  const lines: string[] = ['---']

  if (title) {
    lines.push(`title: ${escapeYamlValue(title)}`)
  }
  if (url) {
    lines.push(`source: ${escapeYamlValue(url)}`)
  }
  if (createdAt) {
    lines.push(`created: ${escapeYamlValue(createdAt)}`)
  }
  if (tags.length > 0) {
    const tagList = tags.map((t) => escapeYamlValue(t)).join(', ')
    lines.push(`tags: [${tagList}]`)
  }

  lines.push('---')
  lines.push('')
  return lines.join('\n')
}

function formatSourceLine(url: string, style: string): string {
  switch (style) {
    case 'markdown-link':
      return `[来源](${url})`
    case 'frontmatter':
      return ''
    default:
      return `来源：${url}`
  }
}

function formatTagLine(tags: string[], style: string): string {
  if (tags.length === 0) return ''

  switch (style) {
    case 'yaml':
      return ''
    default:
      return `标签：${tags.map((t) => `#${t}`).join(' ')}`
  }
}

function normalizeStrongBoundarySpacing(markdown: string): string {
  const lines = markdown.split('\n')
  let inFence = false

  return lines.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      return line
    }

    if (inFence) return line

    return line.replace(
      /\*\*([^*\n]+)\*\*(?=[A-Za-z0-9\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
      '**$1** ',
    )
  }).join('\n')
}

export function formatMarkdownWithProfile(
  input: FormatMarkdownInput,
  target: MarkdownTarget,
): string {
  const profile = getMarkdownProfile(target)
  const body = normalizeStrongBoundarySpacing(cleanMarkdown(input.bodyMarkdown))
  const parts: string[] = []
  const createdAt = input.createdAt ?? new Date().toISOString()

  if (input.clipMode === 'comment-context') {
    if (profile.frontmatter) {
      const fm = buildYamlFrontmatter(input.title, input.url, input.tags, createdAt)
      if (fm) {
        parts.push(fm)
      }
    }
    if (body.trim()) {
      parts.push(body.trim())
    }
    return parts.join('\n')
  }

  if (profile.frontmatter) {
    const fm = buildYamlFrontmatter(input.title, input.url, input.tags, createdAt)
    if (fm) {
      parts.push(fm)
    }
  }

  if (input.title) {
    parts.push(`# ${input.title}`)
    parts.push('')
  }

  if (input.url) {
    const sourceLine = formatSourceLine(input.url, profile.sourceStyle)
    if (sourceLine) {
      parts.push(sourceLine)
      parts.push('')
    }
  }

  if (input.tags.length > 0) {
    const tagLine = formatTagLine(input.tags, profile.tagStyle)
    if (tagLine) {
      parts.push(tagLine)
      parts.push('')
    }
  }

  if (input.note.trim()) {
    parts.push(`> ${input.note.trim()}`)
    parts.push('')
  }

  parts.push('---')
  parts.push('')

  if (input.mode === 'selection') {
    parts.push('> 注：以下内容为网页选区摘录，并非全文。')
    parts.push('')
  }

  if (body.trim()) {
    parts.push(body.trim())
  }

  return parts.join('\n')
}
