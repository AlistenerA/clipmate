import { describe, it, expect } from 'vitest'
import type { CommentClipContext, CommentSelectionMode } from '../src/content/commentSelection'
import { formatCommentContextMarkdown, isDuplicateSourceExcerpt, normalizeContextTextForCompare, buildSemanticCommentContextTitle, getCommentContextSourceSectionLabel, flattenAccidentalCommentContextBlockquote } from '../src/content/commentSelection'

function makeContext(overrides: Partial<CommentClipContext> = {}): CommentClipContext {
  return {
    siteName: 'Test Site',
    pageUrl: 'https://example.com/page',
    pageTitle: 'Original Page Title',
    sourceTitle: 'Better Source Title',
    sourceMedia: [],
    selectedComment: {
      author: 'Alice',
      text: 'This is the selected comment content.',
    },
    warnings: [],
    mode: 'comment-selection',
    reasons: ['selection-first'],
    ...overrides,
  }
}

// ========== formatCommentContextMarkdown ==========

describe('formatCommentContextMarkdown', () => {
  it('outputs sourceTitle as H1', () => {
    const context = makeContext({ sourceTitle: 'My Source Title' })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('# My Source Title')
  })

  it('outputs site name and page URL', () => {
    const context = makeContext({
      siteName: 'Weibo',
      pageUrl: 'https://weibo.com/status/12345',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('平台：Weibo')
    expect(md).toContain('https://weibo.com/status/12345')
  })

  it('outputs Unknown site with source URL only', () => {
    const context = makeContext({ siteName: 'Unknown' })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('平台：Unknown')
    expect(md).toContain('来源：https://example.com/page')
  })

  it('outputs source author when present', () => {
    const context = makeContext({
      sourceAuthor: 'Original Author',
      siteName: 'CSDN',
      sourceObjectType: 'article',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('Original Author')
  })

  it('does not output source author line when absent', () => {
    const context = makeContext({ sourceAuthor: undefined })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('作者：')
  })

  it('outputs source excerpt in 原内容 section', () => {
    const context = makeContext({
      sourceExcerpt: 'This is the beginning of the original post content…',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('## 原内容')
    expect(md).toContain('This is the beginning')
  })

  it('outputs images as markdown image syntax', () => {
    const context = makeContext({
      sourceMedia: [
        { type: 'image', url: 'https://example.com/photo.jpg', alt: 'A nice photo' },
      ],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('![A nice photo](https://example.com/photo.jpg)')
  })

  it('outputs images without alt as image label', () => {
    const context = makeContext({
      sourceMedia: [
        { type: 'image', url: 'https://example.com/photo.jpg' },
      ],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('![image](https://example.com/photo.jpg)')
  })

  it('outputs video poster as link', () => {
    const context = makeContext({
      sourceMedia: [
        { type: 'poster', url: 'https://example.com/poster.jpg', label: 'Video poster' },
      ],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('[Video poster](https://example.com/poster.jpg)')
  })

  it('no media outputs no image syntax', () => {
    const context = makeContext({ sourceMedia: [] })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('![')
  })

  it('outputs comment author when identified', () => {
    const context = makeContext({
      selectedComment: { author: 'Alice', text: 'Great post' },
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('评论者：Alice')
  })

  it('outputs 未识别 when author is undefined', () => {
    const context = makeContext({
      selectedComment: { author: undefined, text: 'Comment content' },
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('评论者：未识别')
  })

  it('includes selected comment text verbatim', () => {
    const context = makeContext({
      selectedComment: { author: 'Bob', text: 'This is exactly what I selected' },
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('This is exactly what I selected')
  })

  it('does not contain other comments', () => {
    const context = makeContext({
      selectedComment: { author: 'Bob', text: 'Only mine' },
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('Other comment')
    expect(md).not.toContain('Another person')
  })

  it('author-unresolved warning shows friendly message', () => {
    const context = makeContext({
      selectedComment: { author: undefined, text: 'Content' },
      warnings: ['author-unresolved'],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('降级说明')
    expect(md).toContain('未能从选区附近识别评论者用户名')
  })

  it('no-media warning shows friendly message', () => {
    const context = makeContext({
      warnings: ['no-media'],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('降级说明')
    expect(md).toContain('未检测到图片')
  })

  it('unknown warnings are escaped', () => {
    const context = makeContext({
      warnings: ['something *weird*'],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('\\*weird\\*')
  })

  it('outputs disclaimer footer', () => {
    const context = makeContext()
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('以上内容为网页选区评论剪藏，并非全文')
  })

  it('no warnings does not output degradation section', () => {
    const context = makeContext({ warnings: [] })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('降级说明')
  })

  it('escapes special markdown chars in title', () => {
    const context = makeContext({ sourceTitle: 'Hello *World* [test]' })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('Hello \\*World\\* \\[test\\]')
  })

  it('escapes special chars in author name', () => {
    const context = makeContext({
      selectedComment: { author: 'Na*me', text: 'Content' },
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('Na\\*me')
  })

  it('escapes special chars in source excerpt', () => {
    const context = makeContext({
      sourceExcerpt: 'Text with *emphasis* here',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('\\*emphasis\\*')
  })

  it('escapes special chars in site name', () => {
    const context = makeContext({ siteName: 'Site [Name]' })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('\\[Name\\]')
  })

  it('escapes dot and dash in excerpt', () => {
    const context = makeContext({
      sourceExcerpt: 'Hello world. Nice - very.',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('\\-')
    expect(md).toContain('\\.')
  })

  it('does not contain DOM references', () => {
    const context = makeContext()
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('<!DOCTYPE')
    expect(md).not.toContain('<html')
    expect(md).not.toContain('<body')
    expect(md).not.toContain('<script')
    expect(md).not.toContain('<style')
  })

  it('does not contain token or API key fields', () => {
    const context = makeContext()
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('token')
    expect(md).not.toContain('api_key')
    expect(md).not.toContain('pageId')
  })

  it('handles multiple source media types', () => {
    const context = makeContext({
      sourceMedia: [
        { type: 'image', url: '/img1.jpg', alt: 'Image 1' },
        { type: 'poster', url: '/poster.jpg', label: 'Video poster' },
        { type: 'link', url: 'https://example.com', label: 'Related link' },
      ],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('![Image 1](/img1.jpg)')
    expect(md).toContain('[Video poster](/poster.jpg)')
    expect(md).toContain('[Related link](https://example.com)')
  })

  it('media section appears in 原内容 section', () => {
    const context = makeContext({
      sourceMedia: [{ type: 'image', url: '/test.jpg', alt: 'Test' }],
    })
    const md = formatCommentContextMarkdown(context)
    const originalIndex = md.indexOf('## 原内容')
    const commentIndex = md.indexOf('## 选中评论')
    const imageIndex = md.indexOf('![Test](/test.jpg)')
    expect(originalIndex).toBeLessThan(imageIndex)
    expect(imageIndex).toBeLessThan(commentIndex)
  })

  it('works for forum-selection mode', () => {
    const context = makeContext({
      mode: 'forum-selection',
      selectedComment: { author: 'ForumUser', text: 'Reply content' },
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('ForumUser')
    expect(md).toContain('Reply content')
  })
})

describe('comment context markdown safety', () => {
  it('serializer does not access chrome API', () => {
    const src = formatCommentContextMarkdown.toString()
    expect(src).not.toContain('chrome.')
  })

  it('serializer does not access storage', () => {
    const src = formatCommentContextMarkdown.toString()
    expect(src).not.toContain('storage')
  })

  it('serializer does not access document', () => {
    const src = formatCommentContextMarkdown.toString()
    expect(src).not.toContain('document')
  })

  it('serializer does not access network', () => {
    const src = formatCommentContextMarkdown.toString()
    expect(src).not.toContain('fetch(')
    expect(src).not.toContain('XMLHttpRequest')
  })
})

// ========== S8.8: single H1 / source / disclaimer ==========

describe('comment context markdown single wrapping', () => {
  it('has exactly one H1', () => {
    const context = makeContext({ sourceTitle: 'Test Title' })
    const md = formatCommentContextMarkdown(context)
    const h1Count = (md.match(/^# (?!##)/gm) || []).length
    expect(h1Count).toBe(1)
  })

  it('has exactly one source line', () => {
    const context = makeContext({ pageUrl: 'https://example.com' })
    const md = formatCommentContextMarkdown(context)
    const sourceCount = (md.match(/^来源：/gm) || []).length
    expect(sourceCount).toBe(1)
  })

  it('has exactly one disclaimer footer', () => {
    const context = makeContext()
    const md = formatCommentContextMarkdown(context)
    const disclaimerCount = (md.match(/^> 注：以上内容为网页选区评论剪藏，并非全文。/gm) || []).length
    expect(disclaimerCount).toBe(1)
  })

  it('does not contain old selection disclaimer', () => {
    const context = makeContext()
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('以下内容为网页选区摘录')
  })
})

// ========== S8.10.1: sourceTitle/sourceExcerpt dedupe ==========

describe('isDuplicateSourceExcerpt', () => {
  it('returns true when sourceExcerpt equals sourceTitle', () => {
    expect(isDuplicateSourceExcerpt('微博：今天天气真好', '微博：今天天气真好')).toBe(true)
  })

  it('returns true when excerpt matches title after stripping platform prefix', () => {
    expect(isDuplicateSourceExcerpt('豆瓣：Test Book', 'Test Book')).toBe(true)
  })

  it('returns true when excerpt matches title with markdown escapes', () => {
    expect(isDuplicateSourceExcerpt('CSDN：Hello \\- World', 'CSDN：Hello - World')).toBe(true)
  })

  it('returns true when excerpt is substring of title', () => {
    expect(isDuplicateSourceExcerpt('微博：标题很长很长很长的内容文本', '标题很长很长')).toBe(true)
  })

  it('returns true when titles share long common prefix', () => {
    expect(isDuplicateSourceExcerpt(
      '微博：今天天气真好适合出去走走看看风景',
      '今天天气真好适合出去走走',
    )).toBe(true)
  })

  it('returns false when excerpt is clearly different', () => {
    expect(isDuplicateSourceExcerpt('微博：Short title', 'This is a completely different excerpt with content')).toBe(false)
  })

  it('returns true for short title with common prefix', () => {
    expect(isDuplicateSourceExcerpt('AB', 'A')).toBe(true)
  })

  it('returns false for empty inputs', () => {
    expect(isDuplicateSourceExcerpt('', 'something')).toBe(false)
    expect(isDuplicateSourceExcerpt('something', '')).toBe(false)
  })
})

describe('normalizeContextTextForCompare', () => {
  it('strips platform prefix', () => {
    expect(normalizeContextTextForCompare('微博：Hello')).toBe('hello')
    expect(normalizeContextTextForCompare('豆瓣：World')).toBe('world')
    expect(normalizeContextTextForCompare('CSDN：Test')).toBe('test')
    expect(normalizeContextTextForCompare('博客：Post')).toBe('post')
  })

  it('strips markdown escape chars', () => {
    expect(normalizeContextTextForCompare('Hello \\- World')).toBe('hello - world')
    expect(normalizeContextTextForCompare('Test \\# Topic')).toBe('test # topic')
  })

  it('strips ellipsis', () => {
    expect(normalizeContextTextForCompare('Hello…')).toBe('hello')
    expect(normalizeContextTextForCompare('World...')).toBe('world')
  })

  it('lowercases output', () => {
    expect(normalizeContextTextForCompare('HELLO World')).toBe('hello world')
  })
})

describe('formatCommentContextMarkdown dedupe', () => {
  it('skips excerpt when it matches sourceTitle exactly', () => {
    const context = makeContext({
      sourceTitle: '微博：Same Title',
      sourceExcerpt: '微博：Same Title',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('## 原内容')
  })

  it('skips excerpt when it matches title without prefix', () => {
    const context = makeContext({
      sourceTitle: '豆瓣：Test Book',
      sourceExcerpt: 'Test Book',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('## 原内容')
  })

  it('skips excerpt but keeps media when duped with media present', () => {
    const context = makeContext({
      sourceTitle: '微博：Photo Post',
      sourceExcerpt: 'Photo Post',
      sourceMedia: [{ type: 'image', url: 'https://img.example.com/fake.jpg', alt: 'photo' }],
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('## 原内容')
    expect(md).toContain('fake.jpg')
    const afterH1 = md.slice(md.indexOf('来源：'))
    expect(afterH1).not.toContain('Photo Post')
  })

  it('keeps excerpt when it differs from title', () => {
    const context = makeContext({
      sourceTitle: '微博：Short',
      sourceExcerpt: 'Completely different longer excerpt text here',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('## 原内容')
    expect(md).toContain('Completely different')
  })

  it('always keeps H1, source, disclaimer', () => {
    const context = makeContext({
      sourceTitle: 'CSDN：Test Title',
      sourceExcerpt: 'Test Title',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('来源：')
    expect(md).toContain('> 注：以上内容为网页选区评论剪藏')
  })
})

describe('buildSemanticCommentContextTitle', () => {
  function cc(overrides: Partial<CommentClipContext> = {}): CommentClipContext {
    return {
      siteName: 'Test Site',
      pageUrl: 'https://example.com/page',
      pageTitle: 'Page Title',
      sourceTitle: 'Source Title',
      sourceMedia: [],
      selectedComment: { author: 'Commenter', text: 'Selected text' },
      warnings: [],
      mode: 'comment-selection',
      reasons: ['selection-first'],
      ...overrides,
    }
  }

  it('Weibo with author+date+location', () => {
    const context = cc({
      siteName: '微博',
      sourceAuthor: '耳朵儿朵儿',
      sourceDate: '06-09 12:23',
      sourceLocation: '浙江',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自 @耳朵儿朵儿 06-09 12:23 发布于浙江的微博')
  })

  it('Weibo with author+date only', () => {
    const context = cc({
      siteName: '微博',
      sourceAuthor: '示例用户',
      sourceDate: '06-09 12:23',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自 @示例用户 06-09 12:23的微博')
  })

  it('Weibo with author+location only', () => {
    const context = cc({
      siteName: '微博',
      sourceAuthor: '示例用户',
      sourceLocation: '北京',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自 @示例用户 发布于北京的微博')
  })

  it('Weibo with author only', () => {
    const context = cc({
      siteName: '微博',
      sourceAuthor: 'withoutAt',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自 @withoutAt 的微博')
  })

  it('Weibo author already has @ prefix', () => {
    const context = cc({
      siteName: '微博',
      sourceAuthor: '@alreadyAt',
    })
    expect(buildSemanticCommentContextTitle(context)).toContain('@alreadyAt')
    expect(buildSemanticCommentContextTitle(context)).not.toContain('@@')
  })

  it('Weibo with short title fallback', () => {
    const context = cc({
      siteName: '微博',
      sourceTitle: '微博：Interesting topic about AI',
    })
    const title = buildSemanticCommentContextTitle(context)
    expect(title).toContain('微博评论剪藏')
    expect(title).not.toContain('自主创作')
    expect(title).not.toContain('关注')
    expect(title).not.toContain('转发')
    expect(title).not.toContain('点赞')
  })

  it('Weibo with nothing returns fallback', () => {
    const context = cc({
      siteName: '微博',
      sourceTitle: '微博评论摘录',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('微博评论剪藏')
  })

  it('Douban book', () => {
    const context = cc({
      siteName: '豆瓣',
      sourceObjectType: 'book',
      sourceObjectTitle: '示例书名',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自《示例书名》的豆瓣书评')
  })

  it('Douban movie', () => {
    const context = cc({
      siteName: '豆瓣',
      sourceObjectType: 'movie',
      sourceObjectTitle: '示例电影名',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自《示例电影名》的豆瓣影评')
  })

  it('Douban music', () => {
    const context = cc({
      siteName: '豆瓣',
      sourceObjectType: 'music',
      sourceObjectTitle: '示例音乐名',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自《示例音乐名》的豆瓣乐评')
  })

  it('Douban with objectTitle but unknown type', () => {
    const context = cc({
      siteName: '豆瓣',
      sourceObjectType: 'unknown',
      sourceObjectTitle: '示例条目',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自《示例条目》的豆瓣评论')
  })

  it('Douban fallback', () => {
    const context = cc({
      siteName: '豆瓣',
      sourceTitle: '豆瓣评论摘录',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('豆瓣评论剪藏')
  })

  it('CSDN/Blog with author+date', () => {
    const context = cc({
      siteName: 'CSDN',
      sourceAuthor: '示例博主',
      sourceDate: '2026-06-09',
      sourceObjectType: 'article',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自 示例博主 2026-06-09 的博客文章')
  })

  it('CSDN/Blog with author only', () => {
    const context = cc({
      siteName: 'cnblogs',
      sourceAuthor: '示例博主',
      sourceObjectType: 'article',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('转自 示例博主 的博客文章')
  })

  it('CSDN/Blog with article title fallback', () => {
    const context = cc({
      siteName: 'CSDN',
      sourceTitle: 'CSDN：Introduction to Python Decorators',
      sourceObjectType: 'article',
    })
    const title = buildSemanticCommentContextTitle(context)
    expect(title).toContain('的博客文章')
    expect(title).not.toContain('CSDN：CSDN')
  })

  it('CSDN/Blog fallback', () => {
    const context = cc({
      siteName: 'CSDN',
      sourceTitle: 'CSDN评论摘录',
      sourceObjectType: 'article',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('博客评论剪藏')
  })

  it('Generic site uses sourceTitle directly', () => {
    const context = cc({
      siteName: 'Example',
      sourceTitle: 'Some Article Title',
    })
    expect(buildSemanticCommentContextTitle(context)).toBe('Some Article Title')
  })
})

describe('getCommentContextSourceSectionLabel', () => {
  function cc(overrides: Partial<CommentClipContext> = {}): CommentClipContext {
    return {
      siteName: 'Test Site',
      pageUrl: 'https://example.com/page',
      pageTitle: 'Page Title',
      sourceTitle: 'Source Title',
      sourceMedia: [],
      selectedComment: { author: 'C', text: 'T' },
      warnings: [],
      mode: 'comment-selection',
      reasons: [],
      ...overrides,
    }
  }

  it('Weibo post uses 博文内容', () => {
    const context = cc({ sourceObjectType: 'post', sourceSectionLabel: '博文内容' })
    expect(getCommentContextSourceSectionLabel(context)).toBe('博文内容')
  })

  it('Douban uses 条目详情', () => {
    const context = cc({ sourceObjectType: 'book', sourceSectionLabel: '条目详情' })
    expect(getCommentContextSourceSectionLabel(context)).toBe('条目详情')
  })

  it('Blog uses 文章内容', () => {
    const context = cc({ sourceObjectType: 'article', sourceSectionLabel: '文章内容' })
    expect(getCommentContextSourceSectionLabel(context)).toBe('文章内容')
  })

  it('Generic uses 原内容', () => {
    const context = cc({})
    expect(getCommentContextSourceSectionLabel(context)).toBe('原内容')
  })
})

describe('flattenAccidentalCommentContextBlockquote', () => {
  it('does not modify markdown with only single-level blockquotes', () => {
    const md = '# Title\n\n来源：https://example.com\n\n> 注：以上内容为网页选区评论剪藏，并非全文。'
    expect(flattenAccidentalCommentContextBlockquote(md)).toBe(md)
  })

  it('does not modify markdown without blockquotes', () => {
    const md = '# Title\n\nPlain text'
    expect(flattenAccidentalCommentContextBlockquote(md)).toBe(md)
  })

  it('strips outer double-quote prefix', () => {
    const md = '> # Title\n> \n> 来源：https://example.com\n> \n> > 注：以上内容为网页选区评论剪藏，并非全文。'
    const result = flattenAccidentalCommentContextBlockquote(md)
    expect(result).not.toContain('> > ')
    expect(result).toContain('# Title')
    expect(result).toContain('来源：https://example.com')
  })

  it('does not add > > to output', () => {
    const md = '> > # Title\n> > \n> > 来源：https://example.com\n> > \n> > > 注：以上内容为网页选区评论剪藏，并非全文。'
    const result = flattenAccidentalCommentContextBlockquote(md)
    expect(result).not.toContain('> >')
    expect(result).not.toContain('> > >')
  })

  it('preserves single-level disclaimer blockquote', () => {
    const md = '> > # Title\n> > \n> > 来源：https://example.com\n> > \n> > > 注：以上内容为网页选区评论剪藏，并非全文。'
    const result = flattenAccidentalCommentContextBlockquote(md)
    expect(result).toContain('> 注：以上内容为网页选区评论剪藏，并非全文。')
  })

  it('handles empty input', () => {
    expect(flattenAccidentalCommentContextBlockquote('')).toBe('')
  })

  it('normal copy markdown does not contain > >', () => {
    const context = makeContext({
      siteName: '微博',
      sourceAuthor: 'testuser',
      sourceDate: '06-09',
      sourceObjectType: 'post',
      sourceSectionLabel: '博文内容',
    })
    const md = formatCommentContextMarkdown(context)
    expect(md).not.toContain('> >')
    expect(md).not.toContain('> > >')
    expect(md).toContain('> 注：以上内容为网页选区评论剪藏，并非全文。')
  })
})
