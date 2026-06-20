import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { resolveCommentContext } from '../src/content/commentSelection/commentContextResolvers'
import { buildSemanticCommentContextTitle, formatCommentContextMarkdown } from '../src/content/commentSelection/commentContextMarkdown'
import type { SiteProfileMatch, SiteProfile } from '../src/shared/siteProfiles'
import type { PageType } from '../src/shared/utils/pageTypeDetector'
import type { CommentClipContext } from '../src/content/commentSelection'

function makeWeiboMatch(): SiteProfileMatch {
  return {
    profile: {
      id: 'weibo-social',
      label: 'Weibo',
      category: 'social',
      domains: ['weibo.com'],
      pageTypes: ['forum-or-comment'] as PageType[],
      priority: 20,
      selectorHints: { contentContainer: 'main' },
    } as SiteProfile,
    matchedDomain: 'weibo.com',
    matchedPageType: 'forum-or-comment' as PageType,
    confidence: 0.9,
    reasons: ['test'],
  }
}

function makeDom(headHtml: string, bodyHtml: string, url?: string): { doc: Document } {
  const fullHtml = `<!DOCTYPE html><html><head>${headHtml}</head><body>${bodyHtml}</body></html>`
  const dom = new JSDOM(fullHtml, { url: url || 'https://weibo.com/status/12345' })
  return { doc: dom.window.document }
}

describe('resolveCommentContext → buildSemanticCommentContextTitle pipeline', () => {
  it('Weibo resolver produces sourceDate from content text', () => {
    const { doc } = makeDom(
      '<title>微博正文 - 微博</title>',
      `<main>
        <article class="feed-content">
          <p>06-14 14:17 发布于美国 今天天气真好适合出去走走</p>
          <img src="https://wx1.sinaimg.cn/large/fake.jpg" width="600" height="400" alt="photo" />
        </article>
        <div class="comment-list">
          <div class="comment-item">
            <strong>Alice</strong>
            <p id="sel">确实不错</p>
          </div>
        </div>
      </main>`,
    )
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: '确实不错',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: ['selection-first'],
    })
    expect(context.sourceDate).toBe('06-14 14:17')
    expect(context.sourceLocation).toBe('美国')
  })

  it('Weibo resolver produces sourceDate with alt date format', () => {
    const { doc } = makeDom(
      '<title>微博正文</title>',
      '<main><article><p>2024-01-15 10:30 发布于北京 今天天气真好</p></article></main>',
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'test',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceDate).toBe('01-15 10:30')
    expect(context.sourceLocation).toBe('北京')
  })

  it('Weibo resolver sets sourceObjectType to post', () => {
    const { doc } = makeDom(
      '<title>微博正文</title>',
      '<main><article><p>content</p></article></main>',
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'test',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceObjectType).toBe('post')
  })

  it('Weibo resolver sets sourceSectionLabel to 博文内容', () => {
    const { doc } = makeDom(
      '<title>微博正文</title>',
      '<main><article><p>content</p></article></main>',
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'test',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceSectionLabel).toBe('博文内容')
  })

  it('buildSemanticCommentContextTitle produces rich title with date and location from resolver context', () => {
    const context: CommentClipContext = {
      siteName: 'Weibo',
      pageUrl: 'https://weibo.com/status/12345',
      pageTitle: '微博正文',
      sourceTitle: '微博：今天天气真好',
      sourceAuthor: 'Alice',
      sourceDate: '06-14 14:17',
      sourceLocation: '美国',
      sourceObjectType: 'post',
      sourceSectionLabel: '博文内容',
      sourceExcerpt: '今天天气真好',
      sourceMedia: [],
      selectedComment: { author: 'Bob', text: '确实不错' },
      warnings: [],
      mode: 'comment-selection',
      reasons: ['selection-first'],
    }
    const title = buildSemanticCommentContextTitle(context)
    expect(title).toBe('转自 @Alice 06-14 14:17 发布于美国的微博')
  })

  it('buildSemanticCommentContextTitle with resolver context: author + date only', () => {
    const context: CommentClipContext = {
      siteName: 'Weibo',
      pageUrl: 'https://weibo.com/status/12345',
      pageTitle: '微博正文',
      sourceTitle: '微博：test',
      sourceAuthor: 'Alice',
      sourceDate: '06-14 14:17',
      sourceSectionLabel: '博文内容',
      sourceExcerpt: 'test',
      sourceMedia: [],
      selectedComment: { author: 'Bob', text: 'comment' },
      warnings: [],
      mode: 'comment-selection',
      reasons: [],
    }
    const title = buildSemanticCommentContextTitle(context)
    expect(title).toBe('转自 @Alice 06-14 14:17的微博')
  })

  it('buildSemanticCommentContextTitle with resolver context: author + location only', () => {
    const context: CommentClipContext = {
      siteName: 'Weibo',
      pageUrl: 'https://weibo.com/status/12345',
      pageTitle: '微博正文',
      sourceTitle: '微博：test',
      sourceAuthor: 'Alice',
      sourceLocation: '美国',
      sourceSectionLabel: '博文内容',
      sourceExcerpt: 'test',
      sourceMedia: [],
      selectedComment: { author: 'Bob', text: 'comment' },
      warnings: [],
      mode: 'comment-selection',
      reasons: [],
    }
    const title = buildSemanticCommentContextTitle(context)
    expect(title).toBe('转自 @Alice 发布于美国的微博')
  })

  it('buildSemanticCommentContextTitle with resolver context: author only (no date/location)', () => {
    const context: CommentClipContext = {
      siteName: 'Weibo',
      pageUrl: 'https://weibo.com/status/12345',
      pageTitle: '微博正文',
      sourceTitle: '微博：test',
      sourceAuthor: 'Alice',
      sourceSectionLabel: '博文内容',
      sourceExcerpt: 'test',
      sourceMedia: [],
      selectedComment: { author: 'Bob', text: 'comment' },
      warnings: [],
      mode: 'comment-selection',
      reasons: [],
    }
    const title = buildSemanticCommentContextTitle(context)
    expect(title).toBe('转自 @Alice 的微博')
  })

  it('formatCommentContextMarkdown H1 matches buildSemanticCommentContextTitle output', () => {
    const context: CommentClipContext = {
      siteName: 'Weibo',
      pageUrl: 'https://weibo.com/status/12345',
      pageTitle: '微博正文',
      sourceTitle: '微博：今天天气真好',
      sourceAuthor: 'Alice',
      sourceDate: '06-14 14:17',
      sourceLocation: '美国',
      sourceObjectType: 'post',
      sourceSectionLabel: '博文内容',
      sourceExcerpt: '今天天气真好',
      sourceMedia: [],
      selectedComment: { author: 'Bob', text: '确实不错' },
      warnings: [],
      mode: 'comment-selection',
      reasons: ['selection-first'],
    }
    const semanticTitle = buildSemanticCommentContextTitle(context)
    const markdown = formatCommentContextMarkdown(context)
    const firstLine = markdown.split('\n')[0]
    expect(firstLine).toBe(`# ${semanticTitle}`)
  })

  it('Douban resolver produces sourceObjectType and sourceSectionLabel', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><meta property="og:title" content="Test Book (豆瓣)" /></head>
<body>
  <div id="content"><div class="article"><h1>Test Book</h1><p>Description</p></div></div>
  <div class="comment-item"><p id="sel">Good!</p></div>
</body></html>`,
      { url: 'https://book.douban.com/subject/fake/' },
    )
    const doc = dom.window.document
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'Test Book (豆瓣)',
      pageUrl: 'https://book.douban.com/subject/fake/',
      siteProfileMatch: {
        profile: {
          id: 'douban-review',
          label: 'Douban',
          category: 'community',
          domains: ['douban.com'],
          pageTypes: ['forum-or-comment'] as PageType[],
          priority: 20,
          selectorHints: { contentContainer: '#content .article' },
        } as SiteProfile,
        matchedDomain: 'douban.com',
        matchedPageType: 'forum-or-comment' as PageType,
        confidence: 0.9,
        reasons: ['test'],
      },
      selectionText: 'Good!',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceObjectType).toBe('book')
    expect(context.sourceSectionLabel).toBe('条目详情')
    expect(context.sourceObjectTitle).toBeDefined()
  })

  it('Blog resolver produces sourceObjectType=article and sourceSectionLabel=文章内容', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body>
<main><article><h1>My Post</h1><p>content</p></article></main>
<div id="commentBox"><p id="sel">Comment</p></div>
</body></html>`,
      { url: 'https://blog.csdn.net/fake/article/details/123' },
    )
    const doc = dom.window.document
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'My Post',
      pageUrl: 'https://blog.csdn.net/fake/article/details/123',
      siteProfileMatch: {
        profile: {
          id: 'blog-tech',
          label: 'Blog',
          category: 'article',
          domains: ['csdn.net'],
          pageTypes: ['article'] as PageType[],
          priority: 15,
          selectorHints: { contentContainer: 'article, main' },
        } as SiteProfile,
        matchedDomain: 'csdn.net',
        matchedPageType: 'article' as PageType,
        confidence: 0.9,
        reasons: ['test'],
      },
      selectionText: 'Comment',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceObjectType).toBe('article')
    expect(context.sourceSectionLabel).toBe('文章内容')
  })

  it('Resolver context sourceMedia is filtered by filterHighQualityMedia', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      `<main><div class="content">
        <img src="https://img.example.com/fake-avatar.jpg" alt="image" width="200" height="200" />
        <img src="https://img.example.com/fake-icon.png" alt="等比图" width="200" height="200" />
        <img src="https://img.example.com/good-photo.jpg" alt="good photo" width="600" height="400" />
      </div></main>`,
      'https://example.com/post',
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'Post',
      pageUrl: 'https://example.com/post',
      siteProfileMatch: null,
      selectionText: 'test',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    const urls = context.sourceMedia.map((m) => m.url || '')
    expect(context.sourceMedia.find((m) => (m.alt || '').toLowerCase() === 'image')).toBeUndefined()
    expect(context.sourceMedia.find((m) => (m.alt || '') === '等比图')).toBeUndefined()
    expect(urls.some((u) => u.includes('good-photo.jpg'))).toBe(true)
  })
})
