import TurndownService from 'turndown'
import { cleanMarkdown } from '../../shared/utils/formatMarkdown'

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
    const preprocessed = mergeAdjacentBold(html)
    const raw = turndown.turndown(preprocessed)
    return cleanMarkdown(raw)
  } catch {
    return html.replace(/<[^>]+>/g, '')
  }
}
