import { describe, it, expect } from 'vitest'
import { buildNotionBlocks, markdownToContentBlocks } from '../src/platforms/notion/blocks'
import type { ClipDraft } from '../src/shared/types/clip.types'

function makeDraft(overrides: Partial<ClipDraft> = {}): ClipDraft {
  return {
    title: '测试文章',
    tags: [],
    note: '',
    mode: 'fullpage',
    content: {
      mode: 'fullpage',
      title: '测试文章',
      url: 'https://example.com/article/1',
      description: '',
      contentText: '',
      contentHtml: '',
      markdown: '',
      wordCount: 0,
      metadata: {
        url: 'https://example.com/article/1',
        title: '测试文章',
        description: '',
        siteName: 'Example',
        createdAt: '2026-06-10T00:00:00.000Z',
      },
    },
    ...overrides,
  }
}

function extractBlockTypes(blocks: Array<{ type: string; [key: string]: unknown }>): string[] {
  return blocks.map((b) => b.type)
}

function imageBlocksOnly(blocks: Array<{ type: string; [key: string]: unknown }>) {
  return blocks.filter((b) => b.type === 'image')
}

describe('markdownToContentBlocks — image conversion', () => {
  it('converts standalone ![alt](https://...) to image external block', () => {
    const blocks = markdownToContentBlocks('![cat](https://example.com/cat.jpg)')

    const imageBlocks = imageBlocksOnly(blocks)
    expect(imageBlocks).toHaveLength(1)
    const img = imageBlocks[0].image as Record<string, unknown>
    expect(img.type).toBe('external')
    expect(img.external).toEqual({ url: 'https://example.com/cat.jpg' })
  })

  it('keeps alt text out of the caption when the source has no real caption', () => {
    const blocks = markdownToContentBlocks('![一只猫](https://example.com/cat.jpg)')

    const img = (imageBlocksOnly(blocks)[0].image as Record<string, unknown>)
    const caption = img.caption as Array<Record<string, unknown>>
    expect(caption).toEqual([])
  })

  it('uses empty caption array when alt is empty', () => {
    const blocks = markdownToContentBlocks('![](https://example.com/cat.jpg)')

    const img = (imageBlocksOnly(blocks)[0].image as Record<string, unknown>)
    const caption = img.caption as Array<Record<string, unknown>>
    expect(caption).toEqual([])
  })

  it('uses empty caption when alt is whitespace only', () => {
    const blocks = markdownToContentBlocks('![   ](https://example.com/cat.jpg)')

    const img = (imageBlocksOnly(blocks)[0].image as Record<string, unknown>)
    const caption = img.caption as Array<Record<string, unknown>>
    expect(caption).toEqual([])
  })

  it('regular paragraphs remain as paragraph blocks', () => {
    const blocks = markdownToContentBlocks('第一段文字\n\n第二段文字')

    const types = extractBlockTypes(blocks)
    expect(types).toEqual(['paragraph', 'paragraph'])
  })

  it('keeps paragraph order with images interspersed', () => {
    const blocks = markdownToContentBlocks(
      'Intro paragraph\n\n![img1](https://a.com/1.jpg)\n\nMiddle paragraph\n\n![img2](https://a.com/2.jpg)\n\nEnd paragraph',
    )

    const types = extractBlockTypes(blocks)
    expect(types).toEqual([
      'paragraph',
      'image',
      'paragraph',
      'image',
      'paragraph',
    ])
  })

  it('converts multiple standalone images', () => {
    const blocks = markdownToContentBlocks(
      '![a](https://a.com/1.jpg)\n\n![b](https://a.com/2.jpg)\n\n![c](https://a.com/3.jpg)',
    )

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(3)
  })

  it('duplicate images both produce image blocks', () => {
    const blocks = markdownToContentBlocks(
      '![a](https://a.com/1.jpg)\n\n![b](https://a.com/1.jpg)',
    )

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(2)
    expect((images[0].image as Record<string, unknown>).external).toEqual({ url: 'https://a.com/1.jpg' })
    expect((images[1].image as Record<string, unknown>).external).toEqual({ url: 'https://a.com/1.jpg' })
  })

  it('data: URI images fall back to paragraph block', () => {
    const blocks = markdownToContentBlocks('![img](data:image/png;base64,abc123)')

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(0)
    expect(extractBlockTypes(blocks)).toEqual(['paragraph'])
  })

  it('blob: URI images fall back to paragraph block', () => {
    const blocks = markdownToContentBlocks('![img](blob:https://example.com/uuid)')

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(0)
    expect(extractBlockTypes(blocks)).toEqual(['paragraph'])
  })

  it('relative URL images fall back to paragraph block', () => {
    const blocks = markdownToContentBlocks('![img](/images/photo.jpg)')

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(0)
    expect(extractBlockTypes(blocks)).toEqual(['paragraph'])
  })

  it('protocol-relative URL images fall back to paragraph block', () => {
    const blocks = markdownToContentBlocks('![img](//cdn.example.com/photo.jpg)')

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(0)
    expect(extractBlockTypes(blocks)).toEqual(['paragraph'])
  })

  it('inline image within text paragraph stays as paragraph', () => {
    const blocks = markdownToContentBlocks(
      'Look at this ![cat](https://example.com/cat.jpg) inline image',
    )

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(0)
    expect(extractBlockTypes(blocks)).toEqual(['paragraph'])
  })

  it('image with special characters in alt works', () => {
    const blocks = markdownToContentBlocks(
      '![图片 - 描述 (2024)](https://example.com/img.jpg)',
    )

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(1)
    const img = images[0].image as Record<string, unknown>
    expect(img.type).toBe('external')
  })

  it('image with query params in URL works', () => {
    const blocks = markdownToContentBlocks(
      '![img](https://example.com/img.jpg?w=800&h=600&token=abc)',
    )

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(1)
    const img = images[0].image as Record<string, unknown>
    expect(img.external).toEqual({ url: 'https://example.com/img.jpg?w=800&h=600&token=abc' })
  })

  it('empty markdown produces no blocks', () => {
    const blocks = markdownToContentBlocks('')
    expect(blocks).toHaveLength(0)
  })

  it('whitespace-only markdown produces no blocks', () => {
    const blocks = markdownToContentBlocks('   \n\n  \n\n  ')
    expect(blocks).toHaveLength(0)
  })

  it('text-only content has zero image blocks', () => {
    const blocks = markdownToContentBlocks('Some text here\n\nMore text')
    expect(imageBlocksOnly(blocks)).toHaveLength(0)
  })

  it('image URL longer than 2000 chars falls back to paragraph (chunked)', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2000) + '.jpg'
    const blocks = markdownToContentBlocks(`![img](${longUrl})`)

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(0)
    // Fallback paragraph may chunk into multiple blocks due to length
    const types = extractBlockTypes(blocks)
    expect(types.every((t) => t === 'paragraph')).toBe(true)
  })

  it('empty URL in image syntax falls back to paragraph', () => {
    const blocks = markdownToContentBlocks('![img]()')

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(0)
    expect(extractBlockTypes(blocks)).toEqual(['paragraph'])
  })

  it('image conversion failure does not affect surrounding paragraphs', () => {
    const blocks = markdownToContentBlocks(
      'Before paragraph\n\n![bad](data:image/png,xxx)\n\nAfter paragraph',
    )

    const types = extractBlockTypes(blocks)
    expect(types).toEqual(['paragraph', 'paragraph', 'paragraph'])
  })
})

describe('buildNotionBlocks — image blocks integration', () => {
  it('fullpage mode produces image blocks for markdown images', () => {
    const draft = makeDraft()
    draft.content.markdown = 'First paragraph\n\n![screenshot](https://example.com/screenshot.png)\n\nSecond paragraph'
    const blocks = buildNotionBlocks(draft)

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(1)

    const img = images[0].image as Record<string, unknown>
    expect(img.type).toBe('external')
    expect(img.external).toEqual({ url: 'https://example.com/screenshot.png' })
  })

  it('fullpage mode preserves heading, source, divider, note blocks', () => {
    const draft = makeDraft({ note: 'test note' })
    draft.content.markdown = '![img](https://example.com/img.jpg)'
    const blocks = buildNotionBlocks(draft)

    expect(blocks.some((b) => b.type === 'heading_2')).toBe(true)
    expect(blocks.some((b) => b.type === 'divider')).toBe(true)
    expect(blocks.some((b) => b.type === 'callout')).toBe(true)
    expect(blocks.some((b) => b.type === 'image')).toBe(true)
  })

  it('selection mode still produces selection callout before content', () => {
    const draft = makeDraft({ mode: 'selection' })
    draft.content.mode = 'selection'
    draft.content.markdown = '![img](https://example.com/img.jpg)\n\nSome text'
    const blocks = buildNotionBlocks(draft)

    const excerptCallout = blocks.find((b) => {
      if (b.type !== 'callout') return false
      return JSON.stringify(b).includes('网页选区摘录')
    })
    expect(excerptCallout).toBeDefined()

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(1)
  })

  it('comment-context mode produces image blocks when image syntax present', () => {
    const draft = makeDraft({ mode: 'selection' })
    draft.content.mode = 'selection'
    draft.content.clipMode = 'comment-context'
    draft.content.markdown = 'Some text\n\n![img](https://example.com/img.jpg)\n\nMore text'
    const blocks = buildNotionBlocks(draft)

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(1)
  })

  it('comment-context mode does not include outer chrome blocks', () => {
    const draft = makeDraft({ mode: 'selection' })
    draft.content.mode = 'selection'
    draft.content.clipMode = 'comment-context'
    draft.content.markdown = '![img](https://example.com/img.jpg)'
    const blocks = buildNotionBlocks(draft)

    expect(blocks.some((b) => b.type === 'heading_2')).toBe(false)
    expect(blocks.some((b) => b.type === 'divider')).toBe(false)
  })

  it('no image blocks when markdown has no images', () => {
    const draft = makeDraft()
    draft.content.markdown = 'Just some text\n\nAnd more text'
    const blocks = buildNotionBlocks(draft)

    expect(imageBlocksOnly(blocks)).toHaveLength(0)
    expect(blocks.some((b) => b.type === 'paragraph')).toBe(true)
  })

  it('multiple images across fullpage content all convert', () => {
    const draft = makeDraft()
    draft.content.markdown =
      '![a](https://a.com/1.jpg)\n\nText between\n\n![b](https://b.com/2.jpg)\n\n![c](https://c.com/3.jpg)'
    const blocks = buildNotionBlocks(draft)

    const images = imageBlocksOnly(blocks)
    expect(images).toHaveLength(3)
  })

  it('data URI in fullpage mode falls back to paragraph', () => {
    const draft = makeDraft()
    draft.content.markdown = '![img](data:image/png;base64,zzz)'
    const blocks = buildNotionBlocks(draft)

    expect(imageBlocksOnly(blocks)).toHaveLength(0)
  })
})
