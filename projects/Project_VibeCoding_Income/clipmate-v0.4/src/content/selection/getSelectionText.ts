const ZERO_WIDTH_CHARS = /[\u200B-\u200F\u2028-\u202F\uFEFF\u00A0\u2060]/g

export function getSelectionText(): string | null {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) return null

  const raw = sel.toString()
  const cleaned = raw.replace(ZERO_WIDTH_CHARS, '').trim()
  return cleaned || null
}
