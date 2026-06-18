import type { LinkCardDraft } from './linkCard.types'

const MARKDOWN_ESCAPE_MAP: Record<string, string> = {
  '\\': '\\\\',
  '*': '\\*',
  _: '\\_',
  '`': '\\`',
  '[': '\\[',
  ']': '\\]',
  '{': '\\{',
  '}': '\\}',
  '<': '\\<',
  '>': '\\>',
  '#': '\\#',
  '+': '\\+',
  '-': '\\-',
  '.': '\\.',
  '!': '\\!',
  '|': '\\|',
  '~': '\\~',
}

export function escapeMarkdownText(text: string): string {
  if (!text) return ''
  let escaped = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    escaped += MARKDOWN_ESCAPE_MAP[char] || char
  }
  return escaped
}

export function formatLinkCardMarkdown(draft: LinkCardDraft): string {
  const lines: string[] = []

  lines.push(`### ${escapeMarkdownText(draft.title)}`)

  if (draft.description) {
    lines.push('')
    lines.push(`> ${escapeMarkdownText(draft.description)}`)
  }

  lines.push('')

  lines.push(`- Source: ${draft.url}`)
  lines.push(`- Domain: ${escapeMarkdownText(draft.domain)}`)
  lines.push(`- Type: ${draft.source}`)

  if (draft.pageType) {
    lines.push(`- Page type: ${escapeMarkdownText(draft.pageType)}`)
  }

  if (draft.siteProfileId) {
    lines.push(`- Site profile: ${escapeMarkdownText(draft.siteProfileId)}`)
  }

  if (draft.siteIconUrl) {
    lines.push(`- Icon: ${draft.siteIconUrl}`)
  }

  if (draft.themeColor) {
    lines.push(`- Theme color: ${draft.themeColor}`)
  }

  if (draft.warning) {
    lines.push('')
    lines.push(`> **${escapeMarkdownText(draft.warning)}**`)
  }

  if (draft.reasons.length > 0) {
    lines.push('')
    const reasonLines = draft.reasons.slice(0, 5).map((r) => `- ${escapeMarkdownText(r)}`)
    lines.push(...reasonLines)
  }

  return lines.join('\n')
}
