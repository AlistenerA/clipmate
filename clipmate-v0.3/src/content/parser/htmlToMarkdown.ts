import TurndownService from 'turndown'
import { cleanMarkdown } from '../../shared/utils/formatMarkdown'
import { preserveMathHtml } from '../../shared/markdown/formulaPreserve'
import { cleanMarkdownCodeBlocks } from '../../shared/markdown/codeBlockCleaner'
import {
  isSafeLinkHref,
  isLikelyImageUrl,
  sanitizeMarkdownCell,
  normalizeImageMarkdown,
} from '../../shared/markdown/mediaLinkTableNormalizer'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
})

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => '~~' + content + '~~',
})

turndown.addRule('img', {
  filter: 'img',
  replacement: (_content, node) => {
    const el = node as HTMLImageElement

    const srcCandidates = [
      el.getAttribute('src'),
      el.getAttribute('currentSrc'),
      el.getAttribute('data-src'),
      el.getAttribute('data-original'),
      el.getAttribute('data-lazy-src'),
      el.getAttribute('data-lazy'),
      el.src,
      (el as HTMLImageElement & { currentSrc?: string }).currentSrc,
    ]

    const bestSrc = srcCandidates.find((s) => isLikelyImageUrl(s)) ?? undefined
    const alt = el.getAttribute('alt') || ''

    return normalizeImageMarkdown({ src: bestSrc, alt })
  },
})

turndown.addRule('figure', {
  filter: 'figure',
  replacement: (content, node) => {
    const el = node as HTMLElement
    const caption = el.querySelector('figcaption')
    if (caption) {
      const capText = caption.textContent?.trim()
      if (capText) {
        const lines = content.trim().split('\n')
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim() === capText) {
            lines[i] = '*' + capText + '*'
            return lines.join('\n')
          }
        }
        return content.trimEnd() + '\n*' + capText + '*'
      }
    }
    return content
  },
})

turndown.addRule('anchor', {
  filter: 'a',
  replacement: (content, node) => {
    const el = node as HTMLAnchorElement
    const href = el.getAttribute('href') ?? ''
    const text = content.trim()

    if (isSafeLinkHref(href)) {
      const linkText = text || href
      const escapedHref = href.replace(/[()]/g, (ch) => ch === '(' ? '%28' : '%29')
      return `[${linkText}](${escapedHref})`
    }

    return text || ''
  },
})

function cellTextWithBreaks(el: HTMLElement): string {
  let result = ''
  for (const child of el.childNodes) {
    if (child.nodeType === 3) {
      result += child.textContent ?? ''
    } else if (child.nodeName === 'BR') {
      result += ' '
    } else if (child instanceof HTMLElement) {
      result += cellTextWithBreaks(child)
    }
  }
  return result
}

turndown.addRule('table', {
  filter: 'table',
  replacement: (_content, node) => {
    const el = node as HTMLTableElement

    const rows: string[][] = []
    let hasHeader = false
    let complex = false

    const headerEls = el.querySelectorAll('thead th, thead td, tr th')
    if (headerEls.length > 0) {
      hasHeader = true
      const headerRow: string[] = []
      headerEls.forEach((cell) => {
        headerRow.push(cellTextWithBreaks(cell as HTMLElement))
      })
      rows.push(headerRow)
    }

    const rowEls = el.querySelectorAll('tr')
    rowEls.forEach((tr) => {
      if (tr.querySelectorAll('th').length > 0 && hasHeader && rows.length === 1) return
      if (tr.querySelector('td[colspan], td[rowspan], th[colspan], th[rowspan]')) {
        complex = true
      }
      const row: string[] = []
      const cells = tr.querySelectorAll('td, th')
      cells.forEach((cell) => {
        row.push(cellTextWithBreaks(cell as HTMLElement))
      })
      if (row.length > 0) rows.push(row)
    })

    if (rows.length === 0) return ''

    if (hasHeader && rows.length <= 1) {
      const headers = rows[0].map((h, i) => sanitizeMarkdownCell(h) || `Column ${i + 1}`)
      return '| ' + headers.join(' | ') + ' |\n' +
        '| ' + headers.map(() => '---').join(' | ') + ' |'
    }

    const sanitized = rows.map((row) =>
      row.map((cell) => sanitizeMarkdownCell(cell)),
    )

    const colCount = Math.max(...sanitized.map((r) => r.length), 0)
    if (colCount === 0) return ''

    const normalized = sanitized.map((row) => {
      while (row.length < colCount) row.push('')
      return row
    })

    if (complex) {
      const simple = normalized
        .map((row) => row.join(' | '))
        .join('\n')
      return `*表格已简化*\n\n${simple}`
    }

    const lines: string[] = []

    if (hasHeader && normalized.length > 0) {
      lines.push('| ' + normalized[0].join(' | ') + ' |')
      lines.push('| ' + Array.from({ length: colCount }, () => '---').join(' | ') + ' |')
      for (let i = 1; i < normalized.length; i++) {
        lines.push('| ' + normalized[i].join(' | ') + ' |')
      }
    } else {
      const defaultHeaders = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`)
      lines.push('| ' + defaultHeaders.join(' | ') + ' |')
      lines.push('| ' + Array.from({ length: colCount }, () => '---').join(' | ') + ' |')
      for (const row of normalized) {
        lines.push('| ' + row.join(' | ') + ' |')
      }
    }

    return lines.join('\n')
  },
})

function mergeAdjacentBold(html: string): string {
  return html.replace(/<\/(strong|b)>\s*<\1>/g, '')
}

function cleanBlockFormulaTrailingDigits(markdown: string): string {
  return markdown.replace(/\$\$([\s\S]*?)\$\$\s*(\d+)/g, '$$$1$$')
}

export function htmlToMarkdown(html: string): string {
  if (!html) return ''
  try {
    const formulaPreservedHtml = preserveMathHtml(html)
    const preprocessed = mergeAdjacentBold(formulaPreservedHtml)
    const raw = turndown.turndown(preprocessed)
    const cleaned = cleanMarkdown(raw)
    const withCleanCode = cleanMarkdownCodeBlocks(cleaned)
    return cleanBlockFormulaTrailingDigits(withCleanCode)
  } catch {
    return html.replace(/<[^>]+>/g, '')
  }
}
