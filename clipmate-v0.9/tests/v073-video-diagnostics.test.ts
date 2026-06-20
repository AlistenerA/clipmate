import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import {
  collectUnknownResourceDiagnostics,
  createClipDocument,
  extractVideoPageSummary,
  formatVideoPageMarkdown,
} from '../src/features/document'
import { clipDocumentToNotionBlocks } from '../src/platforms/notion/blocks'
import { parseMarkdownPreview } from '../src/shared/markdown/markdownPreview'

function documentFrom(html: string, url = 'https://www.bilibili.com/video/BV123/?spm_id_from=test') {
  return new JSDOM(html, { url }).window.document
}

describe('v0.7.3 video page summary', () => {
  it('reduces a Bilibili page to title, canonical link, description and comment count', () => {
    const doc = documentFrom(`
      <head>
        <meta property="og:title" content="Video title_bilibili">
        <meta property="og:url" content="https://www.bilibili.com/video/BV123/">
        <meta name="description" content="简介：A concise introduction；更多攻略 视频播放量 100">
      </head>
      <body><div id="limit-mask-tip">登录后查看 3.9万+ 条评论</div></body>
    `)

    const summary = extractVideoPageSummary(doc, {
      title: 'Fallback title',
      url: doc.URL,
      description: 'Fallback description',
    })

    expect(summary).toEqual({
      title: 'Video title_bilibili',
      url: 'https://www.bilibili.com/video/BV123/',
      description: 'A concise introduction',
      provider: 'Bilibili',
      commentCount: '3.9万+',
    })
    expect(formatVideoPageMarkdown(summary!)).toBe([
      '> Bilibili 视频页摘要',
      '',
      'A concise introduction',
      '',
      '[打开原视频](https://www.bilibili.com/video/BV123/)',
      '',
      '评论数：3.9万+',
    ].join('\n'))
  })

  it('does not classify ordinary article pages as video pages', () => {
    const doc = documentFrom('<article>Article</article>', 'https://example.com/article')
    expect(extractVideoPageSummary(doc, {
      title: 'Article',
      url: doc.URL,
      description: '',
    })).toBeNull()

    const channel = documentFrom('<main>Channel</main>', 'https://www.youtube.com/@example')
    expect(extractVideoPageSummary(channel, {
      title: 'Channel',
      url: channel.URL,
      description: '',
    })).toBeNull()
  })

  it('renders a standalone video link as a preview video card', () => {
    expect(parseMarkdownPreview('[打开原视频](https://www.bilibili.com/video/BV123/)')).toEqual([
      {
        type: 'video',
        title: '打开原视频',
        url: 'https://www.bilibili.com/video/BV123/',
        provider: 'Bilibili',
        safe: true,
      },
    ])
  })

  it('uses native Notion video blocks only for supported embed providers', () => {
    const youtube = createClipDocument({
      title: 'YouTube',
      url: 'https://www.youtube.com/watch?v=abc',
      markdown: '[打开原视频](https://www.youtube.com/watch?v=abc)',
    })
    const bilibili = createClipDocument({
      title: 'Bilibili',
      url: 'https://www.bilibili.com/video/BV123/',
      markdown: '[打开原视频](https://www.bilibili.com/video/BV123/)',
    })

    expect(clipDocumentToNotionBlocks(youtube)[0].type).toBe('video')
    expect(clipDocumentToNotionBlocks(bilibili)[0].type).toBe('bookmark')
  })
})

describe('v0.7.3 tutorial-only diagnostics', () => {
  it('collects unknown resources without adding them to document blocks', () => {
    const doc = documentFrom(`
      <main>
        <iframe title="Interactive exercise" src="https://labs.example.com/demo"></iframe>
        <iframe title="Video" src="https://www.youtube.com/embed/abc"></iframe>
        <canvas aria-label="WebGL chart"></canvas>
        <object class="ad-banner" data="https://ads.example.com/ad"></object>
      </main>
    `, 'https://example.com/tutorial')
    const resources = collectUnknownResourceDiagnostics(doc, doc.URL)
    const clipDocument = createClipDocument({
      title: 'Tutorial',
      url: doc.URL,
      markdown: 'Lesson body',
      unknownResources: resources,
    })

    expect(resources).toEqual([
      {
        kind: 'iframe',
        label: 'Interactive exercise',
        url: 'https://labs.example.com/demo',
      },
      { kind: 'canvas', label: 'WebGL chart', url: undefined },
    ])
    expect(clipDocument.diagnostics?.unknownResources).toEqual(resources)
    expect(clipDocument.blocks).toEqual([{ type: 'paragraph', markdown: 'Lesson body' }])
    expect(JSON.stringify(clipDocumentToNotionBlocks(clipDocument))).not.toContain('Interactive exercise')
  })
})
