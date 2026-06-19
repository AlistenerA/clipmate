import type { NavigationSummaryDraft, NavigationSummaryInput } from './navigationSummary.types'
import { shouldBuildNavigationSummary, buildNavigationSummaryDraft } from './navigationSummaryBuilder'

const MARKDOWN_SPECIAL_CHARS = new Set([
  '\\', '`', '*', '_', '{', '}', '[', ']', '(', ')', '#', '+', '-', '.', '!', '|', '>',
])

export function escapeMarkdownText(text: string): string {
  if (!text) return ''
  let result = ''
  for (const ch of text) {
    if (MARKDOWN_SPECIAL_CHARS.has(ch)) {
      result += '\\' + ch
    } else {
      result += ch
    }
  }
  return result
}

function formatWarning(warning: string): string {
  return `> ${escapeMarkdownText(warning)}`
}

function formatMetadataSection(draft: NavigationSummaryDraft): string {
  const lines: string[] = []
  lines.push(`- Source: ${draft.url}`)
  lines.push(`- Page type: ${escapeMarkdownText(draft.pageType)}`)
  lines.push(`- Domain: ${escapeMarkdownText(draft.domain)}`)
  if (draft.siteProfileId) {
    lines.push(`- Site profile: ${escapeMarkdownText(draft.siteProfileId)}`)
  }
  return lines.join('\n')
}

function formatLinksSection(draft: NavigationSummaryDraft): string {
  if (draft.links.length === 0) {
    return '未找到可安全提取的主要链接。'
  }
  const lines: string[] = []
  for (let i = 0; i < draft.links.length; i++) {
    const link = draft.links[i]
    const escapedText = escapeMarkdownText(link.text)
    const domainSuffix = link.domain ? ` — ${escapeMarkdownText(link.domain)}` : ''
    lines.push(`${i + 1}. [${escapedText}](${link.href})${domainSuffix}`)
  }
  return lines.join('\n')
}

function formatReasonsSection(draft: NavigationSummaryDraft): string {
  const maxReasons = 5
  const reasons = draft.reasons.slice(0, maxReasons)
  if (reasons.length === 0) return ''
  const lines = reasons.map((r) => `- ${escapeMarkdownText(r)}`)
  return lines.join('\n')
}

export function formatNavigationSummaryMarkdown(draft: NavigationSummaryDraft): string {
  const title = escapeMarkdownText(draft.title)
  const sections: string[] = []

  sections.push(`# ${title}`)
  sections.push('')
  sections.push(formatWarning(draft.warning))
  sections.push('')
  sections.push(formatMetadataSection(draft))
  sections.push('')
  sections.push('## 主要链接')
  sections.push('')
  sections.push(formatLinksSection(draft))

  const reasonsText = formatReasonsSection(draft)
  if (reasonsText) {
    sections.push('')
    sections.push('## 生成原因')
    sections.push('')
    sections.push(reasonsText)
  }

  return sections.join('\n')
}

export function buildNavigationMarkdownFallback(
  input: NavigationSummaryInput,
): string | null {
  if (!shouldBuildNavigationSummary(input)) return null

  if (input.intentSnapshot?.selectionPresent && input.intentSnapshot.selectionTextLength > 0) {
    return null
  }

  const draft = buildNavigationSummaryDraft(input)
  return formatNavigationSummaryMarkdown(draft)
}
