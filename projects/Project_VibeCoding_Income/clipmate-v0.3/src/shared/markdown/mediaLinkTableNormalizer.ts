export interface NormalizeImageInput {
  src?: string
  alt?: string
  caption?: string
}

export interface NormalizeLinkInput {
  href?: string
  text?: string
}

export interface NormalizeTableInput {
  rows: string[][]
  hasHeader?: boolean
  complex?: boolean
}

export function isSafeLinkHref(href: string | undefined | null): boolean {
  if (!href) return false
  const h = href.trim().toLowerCase()
  if (!h) return false
  if (h.startsWith('javascript:') || h.startsWith('data:')) return false
  if (/^void\s*\(/.test(h)) return false
  if (/^#null/i.test(h)) return false
  return true
}

export function isLikelyImageUrl(value: string | undefined | null): boolean {
  if (!value) return false
  const v = value.trim()
  if (!v) return false
  if (v.startsWith('data:image/')) return false
  if (v.startsWith('javascript:')) return false
  return /^https?:\/\//.test(v) || /^\/\//.test(v) || v.startsWith('/') || v.startsWith('../')
}

export function sanitizeMarkdownCell(value: string): string {
  if (!value) return ''
  const cleaned = value
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned
}

export function normalizeImageMarkdown(input: NormalizeImageInput): string {
  const { src, alt, caption } = input

  const safeSrc = isLikelyImageUrl(src) ? src : undefined
  const altText = alt?.trim() || (safeSrc ? '' : undefined)

  if (!safeSrc) {
    if (altText) return altText
    return ''
  }

  const lines: string[] = []
  const escapedSrc = safeSrc.replace(/[()]/g, (ch) => ch === '(' ? '%28' : '%29')

  if (altText) {
    lines.push(`![${altText}](${escapedSrc})`)
  } else {
    lines.push(`![](${escapedSrc})`)
  }

  if (caption && caption.trim()) {
    const cap = caption.trim()
    if (cap !== altText) {
      lines.push(`*${cap}*`)
    }
  }

  return lines.join('\n')
}

export function normalizeLinkMarkdown(input: NormalizeLinkInput): string {
  const { href, text } = input

  const safe = isSafeLinkHref(href)

  if (safe && href) {
    const linkText = text?.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim() || href
    const escapedHref = href.replace(/[()]/g, (ch) => ch === '(' ? '%28' : '%29')
    return `[${linkText}](${escapedHref})`
  }

  if (text && text.trim()) {
    return text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim()
  }

  return ''
}

export function normalizeTableMarkdown(input: NormalizeTableInput): string {
  const { rows, hasHeader = false, complex = false } = input

  if (!rows || rows.length === 0) return ''

  const sanitizedRows = rows.map((row) =>
    row.map((cell) => sanitizeMarkdownCell(cell)),
  )

  if (complex || sanitizedRows.length === 0) {
    const simple = sanitizedRows
      .map((row) => row.join(' | '))
      .join('\n')
    if (!simple.trim()) return ''
    return `*表格已简化*\n\n${simple}`
  }

  const colCount = Math.max(...sanitizedRows.map((r) => r.length), 0)
  if (colCount === 0) return ''

  const normalized = sanitizedRows.map((row) => {
    while (row.length < colCount) row.push('')
    return row
  })

  const headerRow: string[] | null = hasHeader && normalized.length > 0
    ? normalized[0]
    : null

  const dataStart = headerRow ? 1 : 0

  const lines: string[] = []

  if (headerRow) {
    lines.push('| ' + headerRow.join(' | ') + ' |')
  } else if (colCount > 0) {
    const defaultHeaders = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`)
    lines.push('| ' + defaultHeaders.join(' | ') + ' |')
  }

  lines.push('| ' + Array.from({ length: colCount }, () => '---').join(' | ') + ' |')

  for (let i = dataStart; i < normalized.length; i++) {
    lines.push('| ' + normalized[i].join(' | ') + ' |')
  }

  return lines.join('\n')
}
