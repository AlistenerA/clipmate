import type { CommentClipContext, CommentSourceMedia } from './commentSelection.types'
import { hasMeaningfulSourceExcerpt, filterHighQualityMedia } from './commentContextCleaners'

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

const PLATFORM_PREFIXES = [
  '微博：', '微博:', 'Weibo：', 'Weibo:',
  '豆瓣：', '豆瓣:', 'Douban：', 'Douban:',
  'CSDN：', 'CSDN:', 'cnblogs：', 'cnblogs:',
  '博客：', '博客:',
  'Bilibili：', 'Bilibili:', 'B站：', 'B站:',
]

export function normalizeContextTextForCompare(text: string): string {
  if (!text) return ''
  let t = text
  for (const prefix of PLATFORM_PREFIXES) {
    if (t.startsWith(prefix)) {
      t = t.slice(prefix.length)
      break
    }
  }
  t = t.replace(/\\(.)/g, (_, ch) => ch)
  t = t.replace(/…|\.\.\./g, '')
  t = t.replace(/\s+/g, ' ').trim()
  t = t.toLowerCase()
  return t
}

export function isDuplicateSourceExcerpt(sourceTitle: string, sourceExcerpt: string): boolean {
  if (!sourceTitle || !sourceExcerpt) return false

  const nTitle = normalizeContextTextForCompare(sourceTitle)
  const nExcerpt = normalizeContextTextForCompare(sourceExcerpt)

  if (nTitle === nExcerpt) return true
  if (nTitle.includes(nExcerpt) || nExcerpt.includes(nTitle)) return true

  const prefix = Math.min(30, Math.min(nTitle.length, nExcerpt.length))
  if (prefix >= 4 && nTitle.slice(0, prefix) === nExcerpt.slice(0, prefix)) return true

  return false
}

export function buildSemanticCommentContextTitle(context: CommentClipContext): string {
  const sn = context.siteName
  const author = context.sourceAuthor
  const date = context.sourceDate
  const location = context.sourceLocation
  const shortTitle = context.sourceTitle?.replace(/^(微博[：:]|豆瓣[：:]|CSDN[：:]|cnblogs[：:])/, '').trim()

  if (sn === '微博' || sn === 'Weibo') {
    if (author && date && location) {
      const atAuthor = author.startsWith('@') ? author : `@${author}`
      return `转自 ${atAuthor} ${date} 发布于${location}的微博`
    }
    if (author && date) {
      const atAuthor = author.startsWith('@') ? author : `@${author}`
      return `转自 ${atAuthor} ${date}的微博`
    }
    if (author && location) {
      const atAuthor = author.startsWith('@') ? author : `@${author}`
      return `转自 ${atAuthor} 发布于${location}的微博`
    }
    if (author) {
      const atAuthor = author.startsWith('@') ? author : `@${author}`
      return `转自 ${atAuthor} 的微博`
    }
    if (shortTitle && shortTitle.length > 0 && shortTitle !== '微博评论摘录') {
      return `微博评论剪藏：${shortTitle.slice(0, 80)}`
    }
    return '微博评论剪藏'
  }

  if (sn === '豆瓣') {
    const objTitle = context.sourceObjectTitle
    const objType = context.sourceObjectType

    if (objTitle && objType === 'book') return `转自《${escapeTitle(objTitle)}》的豆瓣书评`
    if (objTitle && objType === 'movie') return `转自《${escapeTitle(objTitle)}》的豆瓣影评`
    if (objTitle && objType === 'music') return `转自《${escapeTitle(objTitle)}》的豆瓣乐评`
    if (objTitle) return `转自《${escapeTitle(objTitle)}》的豆瓣评论`
    if (shortTitle && shortTitle.length > 0 && shortTitle !== '豆瓣评论摘录') {
      return `豆瓣评论剪藏：${shortTitle.slice(0, 80)}`
    }
    return '豆瓣评论剪藏'
  }

  if (sn === 'CSDN' || sn === 'cnblogs' || context.sourceObjectType === 'article') {
    if (author && date) {
      return `转自 ${escapeTitle(author)} ${date} 的博客文章`
    }
    if (author) {
      return `转自 ${escapeTitle(author)} 的博客文章`
    }
    if (shortTitle && shortTitle.length > 0 && shortTitle !== `${sn}评论摘录`) {
      return `转自《${escapeTitle(shortTitle.slice(0, 60))}》的博客文章`
    }
    return '博客评论剪藏'
  }

  return escapeMd(context.sourceTitle || '评论剪藏')
}

function escapeTitle(text: string): string {
  return text.replace(/^[""''「『【/]/, '').replace(/[""''」』】]$/, '').trim()
}

export function getCommentContextSourceSectionLabel(context: CommentClipContext): string {
  if (context.sourceSectionLabel) return context.sourceSectionLabel
  if (context.sourceObjectType === 'post') return '博文内容'
  if (context.sourceObjectType === 'book' || context.sourceObjectType === 'movie' || context.sourceObjectType === 'music') return '条目详情'
  if (context.sourceObjectType === 'article') return '文章内容'
  return '原内容'
}

export function flattenAccidentalCommentContextBlockquote(markdown: string): string {
  const lines = markdown.split('\n')
  if (lines.length === 0) return markdown

  let hasDouble = false
  for (const line of lines) {
    if (line.startsWith('> > ') || line.startsWith('> > > ')) {
      hasDouble = true
      break
    }
  }
  if (!hasDouble) return markdown

  let isWrappingAll = true
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    if (!line.startsWith('> ')) {
      isWrappingAll = false
      break
    }
  }
  if (!isWrappingAll) return markdown

  const stripped = lines.map((line) => {
    if (line.startsWith('> > > ')) return '> ' + line.slice(6)
    if (line.startsWith('> > ')) return line.slice(4)
    if (line.trim() === '') return line
    return line.slice(2)
  })

  return stripped.join('\n')
}

export function formatCommentContextMarkdown(context: CommentClipContext): string {
  const lines: string[] = []

  const semanticTitle = buildSemanticCommentContextTitle(context)
  const siteLabel = context.siteName !== 'Unknown' ? `平台：${escapeMd(context.siteName)}` : ''
  const sectionLabel = getCommentContextSourceSectionLabel(context)

  lines.push(`# ${semanticTitle}`)
  lines.push('')

  if (siteLabel) {
    lines.push(siteLabel)
  }
  lines.push(`来源：${context.pageUrl}`)

  const hasExcerpt = hasMeaningfulSourceExcerpt(context.sourceExcerpt)
  const qualityMedia = filterHighQualityMedia(context.sourceMedia)
  const hasQualityMedia = qualityMedia.length > 0

  const excerptDeduped =
    context.sourceExcerpt && hasExcerpt
      ? isDuplicateSourceExcerpt(context.sourceTitle, context.sourceExcerpt)
      : false

  const showSourceSection = (!excerptDeduped && hasExcerpt) || hasQualityMedia

  if (showSourceSection) {
    lines.push('')
    lines.push(`## ${escapeMd(sectionLabel)}`)
    lines.push('')

    if (!excerptDeduped && hasExcerpt && context.sourceExcerpt) {
      lines.push(`${escapeMd(context.sourceExcerpt)}`)
      lines.push('')
    } else if (hasExcerpt && excerptDeduped && hasQualityMedia) {
      // Excerpt deduped but quality media exists: show media without excerpt text
    } else if (!hasExcerpt && !hasQualityMedia) {
      lines.push('原内容未能可靠识别，仅保留选中评论。')
      lines.push('')
    }

    if (hasQualityMedia) {
      const maxMedia = hasExcerpt ? 4 : 4
      const filteredMedia = qualityMedia.slice(0, maxMedia)
      lines.push(formatMediaBlock(filteredMedia))
      lines.push('')
    }
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

  const raw = lines.join('\n')
  return flattenAccidentalCommentContextBlockquote(raw)
}
