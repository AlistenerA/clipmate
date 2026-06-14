import type { CommentClipContext, CommentSourceMedia } from './commentSelection.types'

const MARKDOWN_ESCAPE_CHARS: string[] = [
  '\\', '`', '*', '_', '{', '}', '[', ']', '<', '>',
  '(', ')', '#', '+', '-', '.', '!', '|', '~',
]

function escapeMd(text: string): string {
  if (!text) return ''
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (MARKDOWN_ESCAPE_CHARS.includes(ch)) {
      result += '\\' + ch
    } else {
      result += ch
    }
  }
  return result
}

function formatMediaBlock(media: CommentSourceMedia[]): string {
  if (media.length === 0) return ''

  const lines: string[] = []
  for (const m of media) {
    const label = m.alt || m.label || m.type
    const escapedLabel = escapeMd(label)

    if (m.type === 'image' || m.type === 'cover') {
      if (m.url && label) {
        lines.push(`![${escapedLabel}](${m.url})`)
      } else if (m.url) {
        lines.push(`![](${m.url})`)
      }
    } else if (m.type === 'video') {
      if (m.url && label) {
        lines.push(`[${escapedLabel}](${m.url})`)
      } else if (m.url) {
        lines.push(`[Video link](${m.url})`)
      }
    } else if (m.type === 'poster') {
      if (m.url && label) {
        lines.push(`[${escapedLabel}](${m.url})`)
      } else if (m.url) {
        lines.push(`[Video poster](${m.url})`)
      }
    } else if (m.type === 'link') {
      if (m.url && label) {
        lines.push(`[${escapedLabel}](${m.url})`)
      } else if (m.url) {
        lines.push(`[Link](${m.url})`)
      }
    }
  }

  return lines.join('\n')
}

export function formatCommentContextMarkdown(context: CommentClipContext): string {
  const lines: string[] = []

  const siteLabel = context.siteName !== 'Unknown' ? `平台：${escapeMd(context.siteName)}` : ''

  lines.push(`# ${escapeMd(context.sourceTitle)}`)
  lines.push('')

  if (siteLabel) {
    lines.push(siteLabel)
  }
  lines.push(`来源：${context.pageUrl}`)

  if (context.sourceAuthor) {
    lines.push(`作者：${escapeMd(context.sourceAuthor)}`)
  }

  lines.push('')
  lines.push('## 原内容')
  lines.push('')

  if (context.sourceExcerpt) {
    lines.push(`${escapeMd(context.sourceExcerpt)}`)
    lines.push('')
  }

  if (context.sourceMedia.length > 0) {
    lines.push(formatMediaBlock(context.sourceMedia))
    lines.push('')
  }

  lines.push('## 选中评论')
  lines.push('')

  const authorDisplay = context.selectedComment.author
    ? escapeMd(context.selectedComment.author)
    : '未识别'
  lines.push(`评论者：${authorDisplay}`)
  lines.push('')

  lines.push(context.selectedComment.text)
  lines.push('')

  lines.push('---')

  if (context.warnings.length > 0) {
    lines.push('')
    lines.push('> **降级说明**')
    for (const w of context.warnings) {
      if (w === 'author-unresolved') {
        lines.push('> - 未能从选区附近识别评论者用户名。建议手动选区时包含用户名。')
      } else if (w === 'no-media') {
        lines.push('> - 原内容未检测到图片/封面/媒体。')
      } else if (w === 'source-title-unresolved') {
        lines.push('> - 未能从页面提取有效标题。当前显示为页面自带标题，可能不准确。')
      } else {
        lines.push(`> - ${escapeMd(w)}`)
      }
    }
  }

  lines.push('')
  lines.push('> 注：以上内容为网页选区评论剪藏，并非全文。')

  return lines.join('\n')
}
