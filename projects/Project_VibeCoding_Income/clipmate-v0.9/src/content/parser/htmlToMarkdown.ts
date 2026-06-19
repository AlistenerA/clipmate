import TurndownService from 'turndown'
import { cleanMarkdown } from '../../shared/utils/formatMarkdown'
import { preserveMathHtml } from '../../shared/markdown/formulaPreserve'
import { cleanMarkdownCodeBlocks } from '../../shared/markdown/codeBlockCleaner'
import {
  isSafeLinkHref,
  sanitizeMarkdownCell,
  normalizeImageMarkdown,
} from '../../shared/markdown/mediaLinkTableNormalizer'
import {
  isNoiseByClassName,
  isNoiseByAttribute,
  isNoiseByAncestor,
  isNoiseUrl,
  isTrackingPixel,
  isDataUri,
  isBlobUri,
  resolveUrl,
  getBestSrc,
} from '../extractors/articleImages'
import { normalizeImageDescription } from '../../shared/media/imageDescription'
import {
  codeTextFromLayout,
  inferCodeLanguage,
  isSyntaxHighlighterTable,
  normalizeCodeText,
} from './codeContainers'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
})

let imagePageUrl: string | undefined

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => '~~' + content + '~~',
})

turndown.addRule('img', {
  filter: 'img',
  replacement: (_content, node) => {
    return markdownForMediaElement(node as Element)
  },
})

turndown.addRule('videoPoster', {
  filter: (node) => node.nodeName === 'VIDEO' && Boolean((node as HTMLElement).getAttribute('poster')),
  replacement: (_content, node) => markdownForMediaElement(node as Element),
})

turndown.addRule('figure', {
  filter: 'figure',
  replacement: (content, node) => {
    const el = node as HTMLElement
    const caption = el.querySelector('figcaption')
    if (caption) {
      const rawCaption = caption.textContent?.trim()
      if (rawCaption) {
        const preferredCaption = caption.querySelector('[data-testid="caption-paragraph"]')
          ?.textContent?.trim()
        const hasVerbosePrefix = /^(?:图像|图片)(?:加注文字|说明)[，,:：]/.test(rawCaption)
        const shouldNormalizeLabel = Boolean(preferredCaption) || hasVerbosePrefix
        const cleanCaption = normalizeImageDescription(shouldNormalizeLabel
          ? (preferredCaption || rawCaption)
            .replace(/^(?:图像|图片)(?:加注文字|说明)[，,:：]\s*/, '')
            .trim()
          : rawCaption)
        const contentWithoutCaption = content
          .split('\n')
          .filter((line) => line.trim() !== rawCaption && line.trim() !== cleanCaption)
          .join('\n')
          .trim()
        if (!cleanCaption) return contentWithoutCaption
        const capText = shouldNormalizeLabel && cleanCaption
          ? `题注：${cleanCaption}`
          : cleanCaption
        return `${contentWithoutCaption}\n\n*${capText}*`
      }
    }
    return content
  },
})

turndown.addRule('siteCodeContainer', {
  filter: (node) => {
    if (!(node instanceof Element)) return false
    const classes = node.getAttribute('class') || ''
    return /(?:^|\s)(?:example_code|codehilite|syntaxhighlighter)(?:\s|$)/i.test(classes)
  },
  replacement: (_content, node) => {
    const el = node as Element
    const code = normalizeCodeText(codeTextFromLayout(el))
    if (!code.trim()) return ''
    const language = inferCodeLanguage(el, code) || ''
    return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`
  },
})

function markdownForMediaElement(el: Element): string {
  if (isNoiseByClassName(el) || isNoiseByAttribute(el) || isNoiseByAncestor(el)) return ''

  const rawWidth = el.getAttribute('width')
  const rawHeight = el.getAttribute('height')
  const width = rawWidth ? parseInt(rawWidth, 10) : 0
  const height = rawHeight ? parseInt(rawHeight, 10) : 0

  const bestSrc = getBestSrc(el)

  if (bestSrc) {
    if (isDataUri(bestSrc) || isBlobUri(bestSrc)) return ''
    if (isNoiseUrl(bestSrc)) return ''
  }

  if (isTrackingPixel(width, height, bestSrc || '')) return ''

  if (width > 0 && width < 60) return ''
  if (height > 0 && height < 40) return ''

  const resolvedSrc = bestSrc && imagePageUrl ? resolveUrl(bestSrc, imagePageUrl) : bestSrc
  const alt = normalizeImageDescription(el.getAttribute('alt')) ||
    normalizeImageDescription(el.getAttribute('title')) || ''

  return normalizeImageMarkdown({ src: resolvedSrc, alt })
}

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
  filter: (node) => node.nodeName === 'TABLE' && !isSyntaxHighlighterTable(node),
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

turndown.addRule('syntaxHighlighterTable', {
  filter: (node) => isSyntaxHighlighterTable(node),
  replacement: (_content, node) => {
    const el = node as Element
    const code = normalizeCodeText(codeTextFromLayout(el))
    if (!code.trim()) return ''
    const language = inferCodeLanguage(el, code) || ''
    return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`
  },
})

function mergeAdjacentBold(html: string): string {
  return html.replace(/<\/(strong|b)>\s*<\1>/g, '')
}

function cleanBlockFormulaTrailingDigits(markdown: string): string {
  return markdown.replace(/\$\$([\s\S]*?)\$\$\s*(\d+)/g, '$$$1$$')
}

function deduplicateImageMarkdown(md: string): string {
  const seen = new Set<string>()
  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, _alt, url) => {
    if (seen.has(url)) return ''
    seen.add(url)
    return match
  })
}

function splitImageCaptionGlue(md: string): string {
  return md.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\s*(\S[^\n]*)/g,
    (match, alt, url, trailing) => {
      const trimAlt = alt.trim()
      const trimTrail = trailing.trim()

      if (!trimTrail) return match

      if (trimTrail === trimAlt) {
        return `![${alt}](${url})\n\n*${trimTrail}*`
      }

      if (trimTrail.startsWith(trimAlt) && trimTrail.length <= trimAlt.length + 5) {
        return `![${alt}](${url})\n\n*${trimTrail}*`
      }

      return match
    },
  )
}

function normalizeEscapedHeadingOrdinals(markdown: string): string {
  return markdown.replace(/^(#{1,6}\s+\d+)\\\.(?=\s)/gm, '$1.')
}

export function htmlToMarkdown(html: string, pageUrl?: string): string {
  if (!html) return ''
  try {
    imagePageUrl = pageUrl
    const formulaPreservedHtml = preserveMathHtml(html)
    const preprocessed = mergeAdjacentBold(formulaPreservedHtml)
    const raw = turndown.turndown(preprocessed)
    const deduped = deduplicateImageMarkdown(raw)
    const captionFixed = splitImageCaptionGlue(deduped)
    const cleaned = cleanMarkdown(captionFixed)
    const withCleanCode = cleanMarkdownCodeBlocks(cleaned)
    const withCleanHeadingOrdinals = normalizeEscapedHeadingOrdinals(withCleanCode)
    return cleanBlockFormulaTrailingDigits(withCleanHeadingOrdinals)
  } catch {
    return html.replace(/<[^>]+>/g, '')
  }
}
