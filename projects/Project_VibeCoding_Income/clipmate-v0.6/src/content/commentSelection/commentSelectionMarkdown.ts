import type { CommentSelectionDraft } from './commentSelection.types'

const MARKDOWN_ESCAPE_CHARS: string[] = [
  '\\',
  '`',
  '*',
  '_',
  '{',
  '}',
  '[',
  ']',
  '<',
  '>',
  '(',
  ')',
  '#',
  '+',
  '-',
  '.',
  '!',
  '|',
  '~',
]

export function escapeMarkdownText(text: string): string {
  if (!text) return ''
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (MARKDOWN_ESCAPE_CHARS.includes(ch)) {
      result += '\\' + ch
    } else {
      result += ch
    }
  }
  return result
}

export function formatCommentSelectionMarkdown(draft: CommentSelectionDraft): string {
  const lines: string[] = []

  lines.push(`# ${escapeMarkdownText(draft.title)}`)
  lines.push('')

  if (draft.warning) {
    lines.push(`> **Note**: ${escapeMarkdownText(draft.warning)}`)
    lines.push('')
  }

  lines.push(`- Source: ${draft.url}`)
  lines.push(`- Page type: \`${draft.pageType}\``)

  if (draft.siteProfileId) {
    lines.push(`- Site: \`${escapeMarkdownText(draft.siteProfileId)}\``)
  }

  lines.push(`- Selection context: \`${draft.selectionContext}\``)
  lines.push(`- Selected text length: ${draft.selectedTextLength}`)

  if (draft.contextLabel) {
    lines.push(`- Area: ${escapeMarkdownText(draft.contextLabel)}`)
  }

  lines.push('')
  lines.push('---')
  lines.push('')

  if (draft.markdown) {
    lines.push(draft.markdown)
    lines.push('')
  }

  if (draft.reasons.length > 0) {
    lines.push('---')
    lines.push('')
    const reasonItems = draft.reasons.slice(0, 5)
    for (const reason of reasonItems) {
      lines.push(`- ${escapeMarkdownText(reason)}`)
    }
  }

  return lines.join('\n')
}
