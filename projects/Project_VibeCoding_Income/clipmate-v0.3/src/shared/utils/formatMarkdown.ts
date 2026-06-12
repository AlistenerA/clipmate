import { protectLatexSegments } from '../markdown/formulaPreserve'

const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\uff00-\uffef]/g

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0

  let count = 0
  let lastIdx = 0

  let match: RegExpExecArray | null
  while ((match = CJK_RE.exec(trimmed)) !== null) {
    count++
    if (match.index > lastIdx) {
      const segment = trimmed.slice(lastIdx, match.index)
      const words = segment.trim().split(/\s+/).filter(Boolean)
      count += words.length
    }
    lastIdx = match.index + 1
  }

  if (lastIdx < trimmed.length) {
    const remaining = trimmed.slice(lastIdx).trim()
    if (remaining) {
      count += remaining.split(/\s+/).filter(Boolean).length
    }
  }

  return count
}

function doCleanText(text: string): string {
  let cleaned = text
  let prev = ''
  while (prev !== cleaned) {
    prev = cleaned
    cleaned = cleaned.replace(/\*\*(.*?)\*\*\*\*(.*?)\*\*/g, '**$1$2**')
  }

  cleaned = cleaned.replace(/^\*{2}\s*\*{2}$/gm, '')

  return cleaned
}

export function cleanMarkdown(text: string): string {
  if (!text) return text

  const { protected: protectedText, restore } = protectLatexSegments(text)
  const cleaned = doCleanText(protectedText)
  return restore(cleaned)
}

export function formatCopyMarkdown(
  title: string,
  url: string,
  tags: string[],
  note: string,
  bodyMarkdown: string,
): string {
  const parts: string[] = []

  if (title) {
    parts.push(`# ${title}`)
    parts.push('')
  }

  if (url) {
    parts.push(`来源：${url}`)
    parts.push('')
  }

  if (tags.length > 0) {
    parts.push(`标签：${tags.map((t) => `#${t}`).join(' ')}`)
    parts.push('')
  }

  if (note.trim()) {
    parts.push(`> ${note.trim()}`)
    parts.push('')
  }

  parts.push('---')
  parts.push('')

  if (bodyMarkdown.trim()) {
    parts.push(bodyMarkdown.trim())
  }

  return parts.join('\n')
}

export function snippet(text: string, maxLen: number = 120): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}
