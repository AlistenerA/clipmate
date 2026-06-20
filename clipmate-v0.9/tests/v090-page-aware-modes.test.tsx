import { renderToStaticMarkup } from 'react-dom/server'
import ClipModeToggle from '../src/popup/components/ClipModeToggle'
import StatusBar from '../src/popup/components/StatusBar'
import {
  buildPageAwareness,
  getModeLabel,
  recommendPageModes,
  resolveInitialPageMode
} from '../src/shared/utils/pageAwareModes'
import type { PageAwareness } from '../src/shared/types/clip.types'
import type { PageTypeDetectionResult } from '../src/shared/utils/pageTypeDetector'
import { JSDOM } from 'jsdom'
import { detectPageAwareness } from '../src/content/pageAwareness'

function recommend(overrides: Partial<Parameters<typeof recommendPageModes>[0]> = {}) {
  return recommendPageModes({
    pageType: 'article',
    confidence: 0.9,
    selectionPresent: false,
    hasCodeBlock: false,
    ...overrides
  })
}

describe('v0.9 page-aware mode recommendations', () => {
  it('connects a video DOM to a sanitized page-aware recommendation', () => {
    const dom = new JSDOM(`<!doctype html><html><head><title>Watch video</title></head><body>
      <video controls><source src="movie.mp4"></video><p>Short description</p>
    </body></html>`, { url: 'https://video.example.com/watch/42' })
    const result = detectPageAwareness(dom.window.document, false)
    expect(result.pageType).toBe('video')
    expect(result.recommendedMode).toBe('tutorial')
    expect(result).not.toHaveProperty('signals')
  })

  it('recommends and auto-applies video collection on a confident video page', () => {
    const result = recommend({ pageType: 'video', confidence: 0.82 })
    expect(result).toMatchObject({
      recommendedMode: 'tutorial',
      autoApply: true,
      primaryModes: ['tutorial', 'fullpage']
    })
    expect(getModeLabel('tutorial', result)).toBe('视频收藏')
  })

  it('keeps an existing selection ahead of automatic video switching', () => {
    const result = recommend({
      pageType: 'video',
      confidence: 0.9,
      selectionPresent: true
    })
    expect(result.autoApply).toBe(false)
    expect(result.primaryModes).toContain('selection')
  })

  it('recommends tutorial structure for a code-heavy article without auto-switching', () => {
    const result = recommend({ pageType: 'article', hasCodeBlock: true })
    expect(result.recommendedMode).toBe('tutorial')
    expect(result.autoApply).toBe(false)
    expect(result.reason).toContain('代码块')
  })

  it('recommends fullpage for a normal article and selection when one exists', () => {
    expect(recommend().recommendedMode).toBe('fullpage')
    expect(recommend({ selectionPresent: true }).recommendedMode).toBe('selection')
  })

  it('uses actionable fullpage fallback for a discussion without selection', () => {
    const result = recommend({ pageType: 'forum-or-comment' })
    expect(result.recommendedMode).toBe('fullpage')
    expect(result.autoApply).toBe(false)
    expect(result.reason).toContain('先在页面选中文字')
  })

  it('recommends comment selection when a discussion selection exists', () => {
    const result = recommend({
      pageType: 'forum-or-comment',
      selectionPresent: true
    })
    expect(result.recommendedMode).toBe('selection')
    expect(getModeLabel('selection', result)).toBe('评论选区')
  })

  it('auto-applies structured mode for confident AI pages without a selection', () => {
    const result = recommend({ pageType: 'ai-answer', confidence: 0.8 })
    expect(result.recommendedMode).toBe('tutorial')
    expect(result.autoApply).toBe(true)
    expect(getModeLabel('tutorial', result)).toBe('结构化')
  })

  it('uses page summary for navigation and search pages', () => {
    for (const pageType of ['navigation', 'search-results'] as const) {
      const result = recommend({ pageType })
      expect(result.recommendedMode).toBe('fullpage')
      expect(getModeLabel('fullpage', result)).toBe('页面摘要')
    }
  })

  it('falls back to fullpage for unknown pages', () => {
    const result = recommend({ pageType: 'unknown', confidence: 0.4 })
    expect(result.recommendedMode).toBe('fullpage')
    expect(result.autoApply).toBe(false)
  })

  it('does not copy raw detector signals into page awareness', () => {
    const detection: PageTypeDetectionResult = {
      type: 'video',
      confidence: 0.8,
      reasons: ['internal reason'],
      signals: {
        url: 'https://example.com/watch/private',
        title: 'private title',
        domain: 'example.com',
        linkCount: 0,
        linkDensity: 0,
        textLength: 100,
        headingCount: 1,
        paragraphCount: 1,
        listCount: 0,
        formCount: 0,
        videoCount: 1,
        iframeCount: 0,
        articleLikeScore: 0,
        commentLikeCount: 0,
        hasSearchInput: false,
        hasSearchRole: false,
        hasConversationPattern: false,
        hasCodeBlock: false,
        mainTextLength: 100
      }
    }
    const result = buildPageAwareness(detection, false)
    expect(result).not.toHaveProperty('signals')
    expect(result).not.toHaveProperty('url')
    expect(JSON.stringify(result)).not.toContain('private')
  })
})

describe('v0.9 initial recommendation guard', () => {
  const awareness = recommend({ pageType: 'video', confidence: 0.8 })

  it('returns the initial auto-applied mode once', () => {
    expect(resolveInitialPageMode({
      awareness,
      currentMode: 'fullpage',
      alreadyHandled: false,
      userSelected: false
    })).toBe('tutorial')
  })

  it('never overrides restored drafts or an explicit user choice', () => {
    expect(resolveInitialPageMode({
      awareness,
      currentMode: 'fullpage',
      alreadyHandled: true,
      userSelected: false
    })).toBeUndefined()
    expect(resolveInitialPageMode({
      awareness,
      currentMode: 'fullpage',
      alreadyHandled: false,
      userSelected: true
    })).toBeUndefined()
  })

  it('rejects an invalid recommendation from tampered storage', () => {
    const tampered = {
      ...awareness,
      recommendedMode: 'javascript'
    } as unknown as PageAwareness
    expect(resolveInitialPageMode({
      awareness: tampered,
      currentMode: 'fullpage',
      alreadyHandled: false,
      userSelected: false
    })).toBeUndefined()
  })
})

describe('v0.9 page-aware mode UI', () => {
  it('shows primary video modes, recommendation context and a more-modes control', () => {
    const awareness = recommend({ pageType: 'video' })
    const html = renderToStaticMarkup(
      <ClipModeToggle
        mode="tutorial"
        awareness={awareness}
        disabled={false}
        onModeChange={() => undefined}
      />
    )
    expect(html).toContain('视频页')
    expect(html).toContain('视频收藏')
    expect(html).toContain('更多模式')
    expect(html).not.toContain('>选区<')
    expect(html).toContain('aria-pressed="true"')
  })

  it('keeps the legacy three-mode UI when awareness is unavailable', () => {
    const html = renderToStaticMarkup(
      <ClipModeToggle
        mode="fullpage"
        disabled={false}
        onModeChange={() => undefined}
      />
    )
    expect(html).toContain('>全文<')
    expect(html).toContain('>选区<')
    expect(html).toContain('>教程<')
  })

  it('renders a stored reason as escaped text', () => {
    const awareness = {
      ...recommend(),
      reason: '<script>alert(1)</script>'
    }
    const html = renderToStaticMarkup(
      <ClipModeToggle
        mode="fullpage"
        awareness={awareness}
        disabled={false}
        onModeChange={() => undefined}
      />
    )
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('renders safely when stored page awareness has invalid field shapes', () => {
    const awareness = {
      ...recommend(),
      recommendedMode: 'invalid',
      primaryModes: null,
      reason: { unsafe: true }
    } as unknown as PageAwareness
    const html = renderToStaticMarkup(
      <ClipModeToggle
        mode="fullpage"
        awareness={awareness}
        disabled={false}
        onModeChange={() => undefined}
      />
    )
    expect(html).toContain('页面推荐信息不可用')
    expect(html).not.toContain('推荐：')
  })

  it('shows one recommendation marker and adaptive status for specialized modes', () => {
    const awareness = recommend({ pageType: 'video' })
    const toggleHtml = renderToStaticMarkup(
      <ClipModeToggle
        mode="tutorial"
        awareness={awareness}
        disabled={false}
        onModeChange={() => undefined}
      />
    )
    const statusHtml = renderToStaticMarkup(
      <StatusBar
        mode="tutorial"
        awareness={awareness}
        wordCount={20}
        modeLabel="success"
      />
    )

    expect(toggleHtml).not.toContain('推荐：')
    expect((toggleHtml.match(/aria-label="推荐模式"/g) || [])).toHaveLength(1)
    expect(statusHtml).toContain('模式：自适应')
  })
})
