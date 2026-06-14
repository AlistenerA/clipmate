import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import type { CommentSourceMedia } from '../src/content/commentSelection'
import { resolveCommentContext } from '../src/content/commentSelection/commentContextResolvers'
import type { SiteProfileMatch, SiteProfile } from '../src/shared/siteProfiles'
import type { PageType } from '../src/shared/utils/pageTypeDetector'

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

function makeBilibiliMatch(): SiteProfileMatch {
  return {
    profile: {
      id: 'bilibili-video',
      label: 'Bilibili',
      category: 'video',
      domains: ['bilibili.com'],
      pageTypes: ['video'] as PageType[],
      priority: 20,
      selectorHints: { contentContainer: '.video-info-detail' },
    } as SiteProfile,
    matchedDomain: 'bilibili.com',
    matchedPageType: 'video' as PageType,
    confidence: 0.9,
    reasons: ['test'],
  }
}

function makeDom(headHtml: string, bodyHtml: string, url?: string): { doc: Document } {
  const fullHtml = `<!DOCTYPE html><html><head>${headHtml}</head><body>${bodyHtml}</body></html>`
  const dom = new JSDOM(fullHtml, { url: url || 'https://weibo.com/status/12345' })
  return { doc: dom.window.document }
}

// ===== resolveCommentContext =====

describe('resolveCommentContext', () => {
  it('Weibo resolver produces clean title from content container', () => {
    const { doc } = makeDom(
      '<title>微博正文 - 微博</title>',
      `<main>
        <article class="feed-content">
          <p>今天天气真好适合出去走走看看风景</p>
          <img src="https://wx1.sinaimg.cn/large/fake-photo.jpg" width="600" height="400" alt="photo" />
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
    expect(context.siteName).toBe('Weibo')
    expect(context.sourceTitle).toContain('微博：')
    expect(context.sourceTitle).not.toBe('微博正文')
    expect(context.sourceTitle).not.toBe('微博正文 - 微博')
    expect(context.selectedComment.author).toBe('Alice')
  })

  it('Weibo resolver filters outdated Weibo profile selectors', () => {
    const { doc } = makeDom(
      '<title>微博正文 - 微博</title>',
      `<main>
        <article>
          <p>Real content text for testing</p>
          <img src="https://wx2.sinaimg.cn/mw690/fake.jpg" />
        </article>
      </main>`,
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/test',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'test comment',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceTitle).toContain('Real content')
  })

  it('Weibo resolver strips UI noise from title', () => {
    const { doc } = makeDom(
      '<title>微博正文</title>',
      `<main>
        <article>
          <p>返回 公开 真实内容 来自 微博 2024-01-15 关注 转发 3 评论 1</p>
        </article>
      </main>`,
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/test',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'c',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceTitle).toContain('真实内容')
    expect(context.sourceTitle).not.toContain('返回')
    expect(context.sourceTitle).not.toContain('公开')
    expect(context.sourceTitle).not.toContain('来自')
    expect(context.sourceTitle).not.toContain('2024')
    expect(context.sourceTitle).not.toContain('关注')
  })

  it('Weibo resolver filters face/emoji/badge images', () => {
    const { doc } = makeDom(
      '',
      `<main><article>
        <img src="https://face.t.sinajs.cn/fake-emoji.png" alt="[太开心]" />
        <img src="https://h5.sinaimg.cn/upload/svip-badge.png" />
        <img src="https://tvax1.sinaimg.cn/crop.0.0.180.180/fake-avatar.jpg" />
        <img src="https://wx1.sinaimg.cn/large/fake-main.jpg" width="600" height="400" alt="main photo" />
      </article></main>`,
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/test',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'c',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    const urls = context.sourceMedia.map((m) => m.url || '')
    expect(urls.some((u) => u.includes('wx1.sinaimg.cn/large'))).toBe(true)
    expect(context.sourceMedia.find((m) => m.url?.includes('face.t.sinajs.cn'))).toBeUndefined()
    expect(context.sourceMedia.find((m) => m.url?.includes('svip'))).toBeUndefined()
    expect(context.sourceMedia.find((m) => m.url?.includes('crop'))).toBeUndefined()
  })

  it('Weibo resolver keeps sinaimg large/mw690/mw1024 images', () => {
    const { doc } = makeDom(
      '',
      `<main><article>
        <img src="https://wx2.sinaimg.cn/mw690/fake.jpg" width="690" />
        <img src="https://wx3.sinaimg.cn/orj360/fake2.jpg" width="360" />
      </article></main>`,
    )
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/test',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'c',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    const urls = context.sourceMedia.map((m) => m.url || '')
    expect(urls.filter((u) => u.includes('sinaimg.cn')).length).toBe(2)
  })

  it('Weibo fallback when no content container', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'https://weibo.com/status/12345' })
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/status/12345',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'comment',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.siteName).toBe('Weibo')
    expect(context.selectedComment.text).toBe('comment')
  })

  it('Bilibili resolver uses video heading', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><meta property="og:title" content="Video Title - Bilibili" /></head>
<body>
  <main>
    <div class="video-info-detail">
      <h2>My Awesome Video</h2>
      <p>Description here</p>
    </div>
    <div class="comment-list">
      <div class="comment-item"><strong>Bob</strong><p id="sel">Great!</p></div>
    </div>
  </main>
</body></html>`,
      { url: 'https://bilibili.com/video/BV123' },
    )
    const doc = dom.window.document
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'My Awesome Video',
      pageUrl: 'https://bilibili.com/video/BV123',
      siteProfileMatch: makeBilibiliMatch(),
      selectionText: 'Great!',
      selectionRoot: sel,
      mode: 'video-comment-selection',
      reasons: [],
    })
    expect(context.siteName).toBe('Bilibili')
    expect(context.sourceTitle).toContain('My Awesome Video')
    expect(context.selectedComment.author).toBe('Bob')
  })

  it('Bilibili resolver strips platform suffix from og:title', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><meta property="og:title" content="Cool Video - Bilibili" /></head>
<body><main><div class="video-info-detail"><p>desc</p></div></main></body></html>`,
      { url: 'https://bilibili.com/video/BV456' },
    )
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: 'Cool Video - Bilibili',
      pageUrl: 'https://bilibili.com/video/BV456',
      siteProfileMatch: makeBilibiliMatch(),
      selectionText: 'nice',
      selectionRoot: null,
      mode: 'video-comment-selection',
      reasons: [],
    })
    expect(context.sourceTitle).not.toContain('Bilibili')
    expect(context.sourceTitle).toContain('Cool Video')
  })

  it('Bilibili falls back to pageTitle when no heading/meta', () => {
    const dom = new JSDOM(
      '<!DOCTYPE html><html><body></body></html>',
      { url: 'https://bilibili.com/video/BV999' },
    )
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: 'My Bilibili Video',
      pageUrl: 'https://bilibili.com/video/BV999',
      siteProfileMatch: makeBilibiliMatch(),
      selectionText: 'c',
      selectionRoot: null,
      mode: 'video-comment-selection',
      reasons: [],
    })
    expect(context.sourceTitle).toContain('My Bilibili Video')
  })

  it('Bilibili resolver strips _哔哩哔哩_bilibili suffix from og:title', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><meta property="og:title" content="【科技补全106】网易云、QQ音乐都被改造成了游戏外挂？Win11优化_哔哩哔哩_bilibili" /></head>
<body><main><div class="video-desc-container"><p>desc</p></div></main></body></html>`,
      { url: 'https://bilibili.com/video/BV777' },
    )
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: 'Video - Bilibili',
      pageUrl: 'https://bilibili.com/video/BV777',
      siteProfileMatch: makeBilibiliMatch(),
      selectionText: 'nice',
      selectionRoot: null,
      mode: 'video-comment-selection',
      reasons: [],
    })
    expect(context.sourceTitle).not.toContain('哔哩哔哩')
    expect(context.sourceTitle).not.toContain('bilibili')
    expect(context.sourceTitle).toContain('科技补全')
  })

  it('Bilibili resolver does not add Weibo prefix', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html>
<head><meta property="og:title" content="Cool Video - Bilibili" /></head>
<body><main><div class="video-info-container"><p>desc</p></div></main></body></html>`,
      { url: 'https://bilibili.com/video/BV999' },
    )
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: 'Cool Video - Bilibili',
      pageUrl: 'https://bilibili.com/video/BV999',
      siteProfileMatch: makeBilibiliMatch(),
      selectionText: 'c',
      selectionRoot: null,
      mode: 'video-comment-selection',
      reasons: [],
    })
    expect(context.sourceTitle).not.toContain('微博')
    expect(context.sourceTitle).not.toContain('Weibo')
  })

  it('Generic social resolver handles unknown profiles', () => {
    const { doc } = makeDom(
      '<title>Post Title</title>',
      `<main><div class="content">Some post text here</div><div class="comment-item"><p id="sel">Reply</p></div></main>`,
    )
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'Post Title',
      pageUrl: 'https://example.com/post',
      siteProfileMatch: null,
      selectionText: 'Reply',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.siteName).toBeDefined()
    expect(context.selectedComment.text).toBe('Reply')
    expect(context.sourceTitle).toBeDefined()
  })

  it('warnings include author-unresolved when no author identifiable', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      '<div class="comment-item"><p id="sel">Comment</p></div>',
    )
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'Comment',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.warnings).toContain('author-unresolved')
  })

  it('comment text is only user-selected text', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      `<main>
        <p>Original post content</p>
        <div class="comment-list">
          <div class="comment-item"><strong>A</strong><p id="sel">Selected only</p></div>
          <div class="comment-item"><strong>B</strong><p>Other comment</p></div>
        </div>
      </main>`,
    )
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'Selected only',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.selectedComment.text).toBe('Selected only')
    expect(context.selectedComment.text).not.toContain('Other comment')
    expect(context.selectedComment.text).not.toContain('Original post')
  })

  it('reasons are preserved', () => {
    const { doc } = makeDom('<title>Page</title>', '<div class="comment-item"><p id="sel">C</p></div>')
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'C',
      selectionRoot: sel,
      mode: 'forum-selection',
      reasons: ['selection-first', 'context=comment'],
    })
    expect(context.reasons).toEqual(['selection-first', 'context=comment'])
  })

  it('does not contain DOM references', () => {
    const { doc } = makeDom(
      '<title>Page</title>',
      '<div class="comment-item"><p id="sel">Comment</p></div>',
    )
    const sel = doc.querySelector('#sel')
    const context = resolveCommentContext({
      document: doc,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'Comment',
      selectionRoot: sel,
      mode: 'comment-selection',
      reasons: [],
    })
    const json = JSON.stringify(context)
    expect(json).not.toContain('<!DOCTYPE')
    expect(json).not.toContain('<html')
    expect(json).not.toContain('<body')
    expect(json).not.toContain('document')
    expect(json).not.toContain('innerHTML')
  })

  it('mode is preserved', () => {
    const { doc } = makeDom('<title>Page</title>', '<p id="sel">C</p>')
    const sel = doc.querySelector('#sel')
    const modes = ['comment-selection', 'forum-selection', 'video-comment-selection', 'ai-answer-selection'] as const
    for (const mode of modes) {
      const context = resolveCommentContext({
        document: doc,
        pageTitle: 'Page',
        pageUrl: 'https://example.com',
        siteProfileMatch: null,
        selectionText: 'C',
        selectionRoot: sel,
        mode,
        reasons: [],
      })
      expect(context.mode).toBe(mode)
    }
  })
})

// ===== Media filtering =====

describe('resolveCommentContext media filtering', () => {
  it('non-Weibo media are not filtered by Weibo rules', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body><main>
        <div class="video-info-detail">
          <img src="/video-cover.jpg" width="400" height="225" alt="video cover" />
        </div>
      </main></body></html>`,
      { url: 'https://bilibili.com/video/123' },
    )
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: 'Video',
      pageUrl: 'https://bilibili.com/video/123',
      siteProfileMatch: makeBilibiliMatch(),
      selectionText: 'c',
      selectionRoot: null,
      mode: 'video-comment-selection',
      reasons: [],
    })
    expect(context.sourceMedia.length).toBe(1)
    expect(context.sourceMedia[0].url).toContain('video-cover.jpg')
  })

  it('avatar images filtered by class', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body><main>
        <div class="content">
          <img src="/avatar.jpg" class="avatar" width="32" height="32" />
          <img src="/photo.jpg" width="400" height="300" alt="photo" />
        </div>
      </main></body></html>`,
      { url: 'https://example.com' },
    )
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'c',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    const urls = context.sourceMedia.map((m) => m.url || '')
    expect(urls.some((u) => u.includes('photo.jpg'))).toBe(true)
    expect(context.sourceMedia.find((m) => m.url?.includes('avatar'))).toBeUndefined()
  })

  it('small images under 60x60 filtered', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body><main>
        <div class="content">
          <img src="/small.jpg" width="24" height="24" />
          <img src="/normal.jpg" width="200" height="200" />
        </div>
      </main></body></html>`,
      { url: 'https://example.com' },
    )
    const context = resolveCommentContext({
      document: dom.window.document,
      pageTitle: 'Page',
      pageUrl: 'https://example.com',
      siteProfileMatch: null,
      selectionText: 'c',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    const urls = context.sourceMedia.map((m) => m.url || '')
    expect(urls.some((u) => u.includes('normal.jpg'))).toBe(true)
    expect(context.sourceMedia.find((m) => m.url?.includes('small.jpg'))).toBeUndefined()
  })

  it('media max count is 2 for weibo resolver', () => {
    const imgs = Array.from({ length: 5 }, (_, i) =>
      `<img src="https://wx1.sinaimg.cn/large/fake${i}.jpg" width="600" height="400" alt="img${i}" />`
    ).join('')
    const { doc } = makeDom('', `<main><article>${imgs}</article></main>`)
    const context = resolveCommentContext({
      document: doc,
      pageTitle: '微博正文',
      pageUrl: 'https://weibo.com/test',
      siteProfileMatch: makeWeiboMatch(),
      selectionText: 'c',
      selectionRoot: null,
      mode: 'comment-selection',
      reasons: [],
    })
    expect(context.sourceMedia.length).toBeLessThanOrEqual(2)
  })
})
