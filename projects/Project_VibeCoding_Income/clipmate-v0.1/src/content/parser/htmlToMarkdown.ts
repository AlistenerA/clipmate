import TurndownService from 'turndown'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
})

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => '~~' + content + '~~',
})

export function htmlToMarkdown(html: string): string {
  if (!html) return ''
  try {
    return turndown.turndown(html)
  } catch {
    return html.replace(/<[^>]+>/g, '')
  }
}
