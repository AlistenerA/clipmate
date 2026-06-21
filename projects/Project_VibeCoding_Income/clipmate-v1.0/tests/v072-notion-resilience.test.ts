import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import { parseMetadata } from '../src/content/parser/metaParser'
import { createClipDocument } from '../src/features/document'
import { buildNotionBlocks, clipDocumentToNotionBlocks } from '../src/platforms/notion/blocks'
import { formatSaveError } from '../src/popup/hooks/useSaveToNotion'
import type { ClipDraft } from '../src/shared/types/clip.types'

function makeTutorialDraft(markdown: string): ClipDraft {
  const clipDocument = createClipDocument({
    title: 'Tutorial',
    url: 'https://example.com/tutorial',
    markdown,
  })
  return {
    title: 'Tutorial',
    tags: ['typescript', '教程'],
    note: '',
    mode: 'tutorial',
    content: {
      mode: 'tutorial',
      title: 'Tutorial',
      url: 'https://example.com/tutorial',
      description: 'Tutorial description',
      contentText: markdown,
      contentHtml: '',
      markdown,
      wordCount: 10,
      metadata: {
        title: 'Tutorial',
        url: 'https://example.com/tutorial',
        description: 'Tutorial description',
        siteName: 'Example Docs',
        author: 'Ada',
        publishedAt: '2026-06-18T08:30:00.000Z',
        createdAt: '2026-06-19T01:00:00.000Z',
      },
      clipDocument,
    },
  }
}

describe('v0.7.2 Notion resilience', () => {
  it('extracts standard author and publication metadata', () => {
    const dom = new JSDOM(`<!doctype html><html><head>
      <meta property="og:title" content="Article">
      <meta property="og:site_name" content="Example News">
      <meta name="author" content="Ada Lovelace">
      <meta property="article:published_time" content="2026-06-18T08:30:00Z">
    </head></html>`, { url: 'https://example.com/article' })

    expect(parseMetadata(dom.window.document)).toMatchObject({
      author: 'Ada Lovelace',
      publishedAt: '2026-06-18T08:30:00Z',
    })
  })

  it('merges source, author, dates, mode and tags into one metadata callout', () => {
    const blocks = buildNotionBlocks(makeTutorialDraft('## Body'))
    const metadata = blocks.find((block) =>
      block.type === 'callout' && JSON.stringify(block).includes('🔖'),
    )
    const json = JSON.stringify(metadata)

    expect(json).toContain('https://example.com/tutorial')
    expect(json).toContain('Example Docs')
    expect(json).toContain('作者：Ada')
    expect(json).toContain('发布：2026-06-18 08:30')
    expect(json).toContain('模式：教程')
    expect(json).toContain('#typescript #教程')
    expect(blocks.filter((block) => JSON.stringify(block).includes('来源：'))).toHaveLength(1)
  })

  it('splits oversized tables so every nested children array stays within 100 blocks', () => {
    const rows = Array.from({ length: 205 }, (_, index) => `| ${index} | value ${index} |`)
    const document = createClipDocument({
      title: 'Large table',
      url: 'https://example.com/table',
      markdown: ['| id | value |', '| --- | --- |', ...rows].join('\n'),
    })
    const tables = clipDocumentToNotionBlocks(document).filter((block) => block.type === 'table')

    expect(tables).toHaveLength(3)
    for (const tableBlock of tables) {
      const table = (tableBlock as Record<string, unknown>).table as Record<string, unknown>
      const children = table.children as unknown[]
      expect(children.length).toBeLessThanOrEqual(100)
      expect(JSON.stringify(children[0])).toContain('id')
    }
  })

  it('does not invent an image caption from alt text', () => {
    const document = createClipDocument({
      title: 'Image',
      url: 'https://example.com',
      markdown: '![diagram alt](https://cdn.example.com/diagram.png)',
    })
    const imageBlock = clipDocumentToNotionBlocks(document)[0] as Record<string, unknown>
    const image = imageBlock.image as Record<string, unknown>

    expect(image.caption).toEqual([])
  })

  it('formats a short user-facing error with code, batch and HTTP status', () => {
    const message = formatSaveError({
      success: false,
      error: 'NOTION_VALIDATION_ERROR',
      details: { batch: 2, httpStatus: 400, apiCode: 'validation_error' },
    })

    expect(message).toContain('Notion 拒绝了内容格式')
    expect(message).toContain('NOTION_VALIDATION_ERROR / B2 / HTTP 400 / validation_error')
  })
})
