const PLACEHOLDER_PREFIX = '\x00CLIPMATE_LATEX_'

const DISPLAY_BLOCK_RE = /\$\$([\s\S]*?)\$\$/g
const BRACKET_BLOCK_RE = /\\\[([\s\S]*?)\\\]/g
const BRACKET_INLINE_RE = /\\\((.+?)\\\)/g
const INLINE_DOLLAR_RE = /\$(?!\s)(?!\d)([^$\n]*?[^$\s])\$/g

const SCRIPT_TEX_RE = /<script\s+[^>]*type\s*=\s*["']math\/tex[^"']*["'][^>]*>([\s\S]*?)<\/script>/gi
const ANNOTATION_TEX_RE = /<annotation\s+[^>]*encoding\s*=\s*["']application\/x-tex["'][^>]*>([\s\S]*?)<\/annotation>/gi
const DATA_LATEX_RE = /<(\w+)\s[^>]*\bdata-latex\s*=\s*["']([^"']*)["'][^>]*>/gi
const ALT_TEXT_LATEX_RE = /alttext\s*=\s*["']([^"']*)["']/gi
const DATA_KATEX_SRC_RE = /<(\w+)\s[^>]*\bdata-katex-src\s*=\s*["']([^"']*)["'][^>]*>/gi

export function protectLatexSegments(markdown: string): {
  protected: string
  restore: (text: string) => string
} {
  if (!markdown) {
    return {
      protected: markdown,
      restore: (text: string) => text,
    }
  }

  const segments: string[] = []
  let idx = 0
  let processed = markdown

  processed = processed.replace(DISPLAY_BLOCK_RE, (match) => {
    segments.push(match)
    return `${PLACEHOLDER_PREFIX}${idx++}`
  })

  processed = processed.replace(BRACKET_BLOCK_RE, (match) => {
    segments.push(match)
    return `${PLACEHOLDER_PREFIX}${idx++}`
  })

  processed = processed.replace(BRACKET_INLINE_RE, (match) => {
    segments.push(match)
    return `${PLACEHOLDER_PREFIX}${idx++}`
  })

  processed = processed.replace(INLINE_DOLLAR_RE, (match) => {
    segments.push(match)
    return `${PLACEHOLDER_PREFIX}${idx++}`
  })

  const restore = (text: string): string => {
    let result = text
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      result = result.replace(`${PLACEHOLDER_PREFIX}${i}`, () => seg)
    }
    return result
  }

  return { protected: processed, restore }
}

export function normalizeLatexDelimiters(text: string): string {
  if (!text) return text

  let result = text
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_m, g1) => `$$${g1}$$`)
  result = result.replace(/\\\((.+?)\\\)/g, (_m, g1) => `$${g1}$`)
  result = result.replace(/\$\$\$(\S)/g, (_m, g1) => `$$ ${g1}`)
  result = result.replace(/(\S)\$\$\$/g, (_m, g1) => `${g1} $$`)
  return result
}

export function preserveMathHtml(html: string): string {
  if (!html) return html

  let result = html

  result = result.replace(SCRIPT_TEX_RE, (_match, content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return ''
    const type = _match.match(/type\s*=\s*["']([^"']*)["']/i)?.[1] ?? ''
    const isDisplay = /mode\s*=\s*display/i.test(type)
    return isDisplay ? `\n$$${trimmed}$$\n` : `$${trimmed}$`
  })

  result = result.replace(ANNOTATION_TEX_RE, (_match, content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return ''
    return `$${trimmed}$`
  })

  result = result.replace(DATA_LATEX_RE, (match, _tag, latex: string) => {
    const trimmed = latex.trim()
    if (!trimmed) return match
    return `$${trimmed}$`
  })

  result = result.replace(DATA_KATEX_SRC_RE, (match, _tag, latex: string) => {
    const trimmed = latex.trim()
    if (!trimmed) return match
    return `$${trimmed}$`
  })

  result = result.replace(ALT_TEXT_LATEX_RE, (match, latex: string) => {
    const trimmed = latex.trim()
    if (!trimmed) return match
    if (/\$|\\|[_^{]/.test(trimmed)) {
      return `$${trimmed}$`
    }
    return match
  })

  return result
}
