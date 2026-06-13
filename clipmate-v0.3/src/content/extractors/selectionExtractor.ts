import { getSelectionHtml } from '../selection/getSelectionHtml'
import { getSelectionText } from '../selection/getSelectionText'

export interface SelectionResult {
  html: string
  text: string
}

export function normalizeSelectionHtml(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return html

  const blockStartRe = /^\s*<(p|div|h[1-6]|ul|ol|blockquote|pre|table|figure|li)/i
  if (blockStartRe.test(trimmed)) return html

  const firstTag = trimmed.search(/</)

  if (firstTag === -1) {
    return `<p>${trimmed}</p>`
  }

  if (firstTag > 0) {
    const leading = trimmed.slice(0, firstTag).trim()
    const rest = trimmed.slice(firstTag)
    return leading ? `<p>${leading}</p>${rest}` : rest
  }

  return html
}

export function extractSelection(): SelectionResult | null {
  const text = getSelectionText()
  if (!text) return null

  const rawHtml = getSelectionHtml() || ''
  const html = normalizeSelectionHtml(rawHtml)

  return { html, text }
}
