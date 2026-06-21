import { describe, expect, it } from 'vitest'
import {
  chooseImageSaveStrategy,
  createFigureAssetsFromArticleImages,
  createFigureAssetsFromMarkdown,
  createImageAssetQualityReport,
  isLikelyDirectExternalImageUrl,
} from '../src/features/assets'
import { createNotionSavePlan } from '../src/features/notion'
import type { ArticleImageCandidate } from '../src/content/extractors/articleImages'
import type { ClipDraft, ExtractedContent } from '../src/shared/types/clip.types'

function makeArticleImage(overrides: Partial<ArticleImageCandidate> = {}): ArticleImageCandidate {
  return {
    url: overrides.url ?? 'https://cdn.example.com/article/photo.jpg',
    alt: overrides.alt ?? 'Article photo',
    title: overrides.title,
    caption: overrides.caption,
    width: overrides.width ?? 800,
    height: overrides.height ?? 450,
    sourceUrl: overrides.sourceUrl ?? 'https://example.com/article',
    index: overrides.index ?? 0,
    origin: overrides.origin ?? 'img',
  }
}

function makeContent(overrides: Partial<ExtractedContent> = {}): ExtractedContent {
  return {
    mode: 'fullpage',
    title: 'Asset note',
    url: 'https://example.com/article',
    description: '',
    contentText: '',
    contentHtml: '',
    markdown: 'Intro\n\n![Article photo](https://cdn.example.com/article/photo.jpg)',
    wordCount: 2,
    metadata: {
      url: 'https://example.com/article',
      title: 'Asset note',
      description: '',
      siteName: 'Example',
      createdAt: '2026-06-17T00:00:00.000Z',
    },
    ...overrides,
  }
}

function makeDraft(overrides: Partial<ClipDraft> = {}): ClipDraft {
  return {
    title: 'Asset note',
    tags: [],
    note: '',
    mode: 'fullpage',
    content: makeContent(),
    ...overrides,
  }
}

describe('asset pipeline foundation', () => {
  it('creates figure assets from article image candidates', () => {
    const assets = createFigureAssetsFromArticleImages([
      makeArticleImage({ caption: 'Caption', origin: 'figure' }),
    ])

    expect(assets).toHaveLength(1)
    expect(assets[0]).toMatchObject({
      kind: 'image',
      role: 'figure',
      url: 'https://cdn.example.com/article/photo.jpg',
      caption: 'Caption',
      origin: 'figure',
    })
    expect(assets[0].id).toMatch(/^img-0-/)
  })

  it('creates de-duplicated figure assets from Markdown image references', () => {
    const assets = createFigureAssetsFromMarkdown(
      '![a](https://cdn.example.com/a.jpg)\n\n![again](https://cdn.example.com/a.jpg)\n\n![b](https://cdn.example.com/b.jpg)',
      'https://example.com/article',
    )

    expect(assets).toHaveLength(2)
    expect(assets[0].alt).toBe('a')
    expect(assets[0].sourceUrl).toBe('https://example.com/article')
    expect(assets[1].url).toBe('https://cdn.example.com/b.jpg')
  })

  it('marks direct http image URLs ready for Notion external blocks', () => {
    const [asset] = createFigureAssetsFromArticleImages([makeArticleImage()])
    const strategy = chooseImageSaveStrategy(asset)

    expect(strategy.type).toBe('notion-external')
    expect(strategy.status).toBe('ready')
    expect(strategy.requiresPermissionReview).toBe(false)
    expect(strategy.requiresBinaryFetch).toBe(false)
  })

  it('marks proxy/resize URLs as File Upload external import candidates only when explicitly evaluated', () => {
    const [asset] = createFigureAssetsFromArticleImages([
      makeArticleImage({ url: 'https://img.example.com/api/auto/resize?img=https://origin.example.com/a.jpg' }),
    ])

    const defaultStrategy = chooseImageSaveStrategy(asset)
    const candidateStrategy = chooseImageSaveStrategy(asset, {
      fileUploadExternalImport: 'candidate',
    })

    expect(defaultStrategy.type).toBe('skip')
    expect(defaultStrategy.reason).toBe('notion_external_maybe_unsupported')
    expect(candidateStrategy.type).toBe('notion-file-upload-external-import')
    expect(candidateStrategy.status).toBe('candidate')
    expect(candidateStrategy.requiresPermissionReview).toBe(true)
  })

  it('blocks data, blob, and relative image URLs with explicit reasons', () => {
    const urls = [
      ['data:image/png;base64,abc', 'data_uri'],
      ['blob:https://example.com/id', 'blob_uri'],
      ['/images/photo.jpg', 'non_http_url'],
    ] as const

    for (const [url, reason] of urls) {
      const [asset] = createFigureAssetsFromArticleImages([makeArticleImage({ url })])
      const strategy = chooseImageSaveStrategy(asset)
      expect(strategy.status).toBe('blocked')
      expect(strategy.reason).toBe(reason)
    }
  })

  it('creates an image quality report with ready, candidate, and blocked counts', () => {
    const assets = createFigureAssetsFromMarkdown([
      '![direct](https://cdn.example.com/direct.jpg)',
      '![proxy](https://img.example.com/api/auto/resize?img=https://origin.example.com/a.jpg)',
      '![bad](blob:https://example.com/id)',
    ].join('\n\n'))

    const report = createImageAssetQualityReport(assets, {
      fileUploadExternalImport: 'candidate',
    })

    expect(report.total).toBe(3)
    expect(report.ready).toBe(1)
    expect(report.candidates).toBe(1)
    expect(report.blocked).toBe(1)
    expect(report.issues.map((issue) => issue.reason)).toEqual([
      'file_upload_external_import_not_enabled',
      'blob_uri',
    ])
  })

  it('keeps markdown target strategy separate from Notion external compatibility', () => {
    const [asset] = createFigureAssetsFromArticleImages([
      makeArticleImage({ url: 'https://img.example.com/api/auto/resize?img=https://origin.example.com/a.jpg' }),
    ])

    const strategy = chooseImageSaveStrategy(asset, { target: 'markdown' })

    expect(strategy.type).toBe('markdown-reference')
    expect(strategy.status).toBe('ready')
  })

  it('exposes the direct external image compatibility predicate', () => {
    expect(isLikelyDirectExternalImageUrl('https://cdn.example.com/photo.jpg')).toBe(true)
    expect(isLikelyDirectExternalImageUrl('https://img.example.com/api/auto/resize?img=https://x/a.jpg')).toBe(false)
  })
})

describe('Notion save plan asset report', () => {
  it('attaches an asset quality report without changing block generation', () => {
    const draft = makeDraft()
    const result = createNotionSavePlan(
      { notionToken: 'secret-token' },
      { draft, pageId: 'page-1' },
    )

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.plan.blocks.some((block) => block.type === 'image')).toBe(true)
    expect(result.plan.assetReport.total).toBe(1)
    expect(result.plan.assetReport.ready).toBe(1)
  })

  it('reports File Upload candidates for Notion-incompatible external URLs', () => {
    const draft = makeDraft({
      content: makeContent({
        markdown: '![proxy](https://img.example.com/api/auto/resize?img=https://origin.example.com/a.jpg)',
      }),
    })
    const result = createNotionSavePlan(
      { notionToken: 'secret-token' },
      { draft, pageId: 'page-1' },
    )

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.plan.assetReport.candidates).toBe(1)
    expect(result.plan.assetReport.issues[0].reason).toBe('file_upload_external_import_not_enabled')
  })
})
