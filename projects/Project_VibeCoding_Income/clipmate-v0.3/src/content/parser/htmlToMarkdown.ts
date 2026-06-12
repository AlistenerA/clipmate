import TurndownService from 'turndown'
import { cleanMarkdown } from '../../shared/utils/formatMarkdown'
import { preserveMathHtml } from '../../shared/markdown/formulaPreserve'
import { cleanMarkdownCodeBlocks } from '../../shared/markdown/codeBlockCleaner'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
})

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => '~~' + content + '~~',
})

function mergeAdjacentBold(html: string): string {
  return html.replace(/<\/(strong|b)>\s*<\1>/g, '')
}

export function htmlToMarkdown(html: string): string {
  if (!html) return ''
  try {
    const formulaPreservedHtml = preserveMathHtml(html)
    const preprocessed = mergeAdjacentBold(formulaPreservedHtml)
    const raw = turndown.turndown(preprocessed)
    const cleaned = cleanMarkdown(raw)
    return cleanMarkdownCodeBlocks(cleaned)
  } catch {
    return html.replace(/<[^>]+>/g, '')
  }
}
