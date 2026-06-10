export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function snippet(text: string, maxLen: number = 120): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}
