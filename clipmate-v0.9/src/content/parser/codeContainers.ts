const SITE_CODE_SELECTOR = '.example_code, .codehilite, .syntaxhighlighter'

export function codeTextWithBreaks(node: Node): string {
  let result = ''
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      result += child.textContent || ''
    } else if (child.nodeName === 'BR') {
      result += '\n'
    } else {
      result += codeTextWithBreaks(child)
    }
  }
  return result
}

export function codeTextFromLayout(el: Element): string {
  const lines = el.querySelectorAll('td.code .line, .code .container > .line')
  if (lines.length > 0) {
    return Array.from(lines)
      .map((line) => line.textContent?.replace(/\u00a0/g, ' ').trimEnd() || '')
      .join('\n')
  }
  return codeTextWithBreaks(el)
}

export function normalizeCodeText(code: string): string {
  const lines = code
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/^\s*\n|\n\s*$/g, '')
    .split('\n')
  if (lines.length > 0) lines[0] = lines[0].trimStart()
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)?.[0].length || 0)
  const commonIndent = indents.length > 0 ? Math.min(...indents) : 0
  return lines.map((line) => line.slice(commonIndent)).join('\n').trimEnd()
}

function languageFromClassTokens(el: Element): string | undefined {
  const aliases: Record<string, string> = {
    bash: 'bash',
    css: 'css',
    html: 'html',
    java: 'java',
    javascript: 'javascript',
    js: 'javascript',
    json: 'json',
    py: 'python',
    python: 'python',
    shell: 'bash',
    sql: 'sql',
    ts: 'typescript',
    typescript: 'typescript',
    xhtml: 'html',
    xml: 'html',
  }
  const candidates = [el, el.closest(SITE_CODE_SELECTOR)]
  for (const candidate of candidates) {
    const tokens = (candidate?.getAttribute('class') || '').toLowerCase().split(/\s+/)
    for (const token of tokens) {
      if (aliases[token]) return aliases[token]
    }
  }
  return undefined
}

export function inferCodeLanguage(el: Element, code: string): string | undefined {
  const explicit = [
    el.getAttribute('data-language'),
    el.getAttribute('data-lang'),
    el.getAttribute('lang'),
    el.className,
  ].filter(Boolean).join(' ')
  const explicitMatch = /(?:language|lang|brush|highlight-source)[-:\s]+([a-z0-9+#.-]+)/i.exec(explicit)
  if (explicitMatch) return explicitMatch[1].toLowerCase()
  const classLanguage = languageFromClassTokens(el)
  if (classLanguage) return classLanguage

  if (/\\(?:documentclass|begin|end|section|usepackage)\b/.test(code)) return 'latex'
  if (/\b(?:interface|enum|namespace)\s+\w+|\b(?:const|let|var)\s+\w+\s*:\s*[A-Za-z_$]/.test(code)) {
    return 'typescript'
  }
  if (/^\s*(?:python\s+)?(?:def|from|import)\s+\w+/m.test(code)) return 'python'
  if (/^\s*(?:public|private|protected)?\s*(?:class|interface)\s+\w+/m.test(code)) return 'java'
  return undefined
}

export function isSyntaxHighlighterTable(node: Element): boolean {
  return node.nodeName === 'TABLE' && Boolean(
    node.querySelector('td.gutter') && node.querySelector('td.code')
  )
}

export function normalizeSiteCodeContainers(doc: Document): void {
  const containers = Array.from(doc.querySelectorAll(SITE_CODE_SELECTOR))
    .filter((container) => !container.querySelector(SITE_CODE_SELECTOR))

  for (const container of containers) {
    const code = normalizeCodeText(codeTextFromLayout(container))
    if (!code.trim()) continue

    const pre = doc.createElement('pre')
    const codeElement = doc.createElement('code')
    const language = inferCodeLanguage(container, code)
    if (language) codeElement.className = `language-${language}`
    codeElement.textContent = code
    pre.appendChild(codeElement)
    container.replaceWith(pre)
  }
}
