import { describe, it, expect } from 'vitest'
import type { CommentClipContext, CommentSelectionMode } from '../src/content/commentSelection'
import { formatCommentContextMarkdown } from '../src/content/commentSelection'

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
    const context = makeContext({ sourceAuthor: 'Original Author' })
    const md = formatCommentContextMarkdown(context)
    expect(md).toContain('作者：Original Author')
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
