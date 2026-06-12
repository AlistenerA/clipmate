export function getSelectionText(): string | null {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) return null

  const text = sel.toString().trim()
  return text || null
}
