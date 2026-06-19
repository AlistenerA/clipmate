import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  extractArticleImages,
} from '../src/content/extractors/articleImages'
import type { ClipMateSettingsV2, NotionTarget, ClipHistoryItem } from '../src/shared/types/settings.types'
import type { ClipDraft, ExtractedContent } from '../src/shared/types/clip.types'
import type { SaveToNotionPayload } from '../src/shared/types/message.types'
import { handleSaveToNotion } from '../src/background/handlers/notionHandler'
import { DEFAULT_SETTINGS_V2, STORAGE_KEYS } from '../src/shared/constants/defaults'
import { buildHistoryInput } from '../src/popup/utils/historyPayload'

function createDocument(bodyHtml: string): Document {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${bodyHtml}</body></html>`)
  return dom.window.document
}

let idCounter = 0

vi.mock('../src/shared/utils/id', () => ({
  generateId: vi.fn(() => {
    idCounter++
    return `00000000-0000-4000-a000-${String(idCounter).padStart(12, '0')}`
  }),
}))

const mockStore: Record<string, unknown> = {}

function mockFetch(status: number, body?: unknown) {
  ;(globalThis as unknown as Record<string, unknown>).fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body || {}),
    })
  ) as unknown as typeof fetch
}

function makeTarget(overrides: Partial<NotionTarget> = {}): NotionTarget {
  return {
    id: overrides.id ?? 'target-1',
    name: overrides.name ?? 'Test Target',
    pageId: overrides.pageId ?? 'abc123def4567890abc123def4567890',
    isDefault: overrides.isDefault ?? true,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    lastUsedAt: overrides.lastUsedAt,
  }
}

function makeSettings(overrides: Partial<ClipMateSettingsV2> = {}): ClipMateSettingsV2 {
  return {
    ...DEFAULT_SETTINGS_V2,
    notionToken: 'secret_test_token',
    notionTargets: [makeTarget()],
    saveHistoryEnabled: true,
    ...overrides,
  }
}

function makeDraft(overrides?: Partial<ExtractedContent>): ClipDraft {
  const content: ExtractedContent = {
    mode: 'fullpage',
    title: 'Test Page',
    url: 'https://example.com',
    description: 'A test page',
    contentText: 'This is the main content.',
    contentHtml: '<p>This is the main content.</p>',
    markdown: 'This is the main content.',
    wordCount: 5,
    metadata: {
      url: 'https://example.com',
      title: 'Test Page',
      description: 'A test page',
      siteName: 'Example',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    ...overrides,
  }
  return {
    title: content.title,
    tags: ['test'],
    note: 'some note',
    mode: content.mode,
    content,
  }
}

function makePayload(overrides: Partial<SaveToNotionPayload> = {}): SaveToNotionPayload {
  const draft = makeDraft()
  return {
    draft,
    targetId: 'target-1',
    targetName: 'Test Target',
    pageId: 'abc123def4567890abc123def4567890',
    ...overrides,
  }
}

function setRawSettings(settings: ClipMateSettingsV2): void {
  mockStore[STORAGE_KEYS.SETTINGS] = settings
}

function getHistory(): ClipHistoryItem[] {
  return (mockStore[STORAGE_KEYS.HISTORY] as ClipHistoryItem[] | undefined) ?? []
}

beforeEach(() => {
  idCounter = 0
  Object.keys(mockStore).forEach((k) => delete mockStore[k])
  ;(globalThis as unknown as Record<string, unknown>).chrome = {
    storage: {
      local: {
        get: vi.fn((keys: string | string[] | Record<string, unknown>) => {
          const key = typeof keys === 'string'
            ? keys
            : Array.isArray(keys)
              ? keys[0]
              : Object.keys(keys)[0]
          const value = mockStore[key]
          return Promise.resolve(value !== undefined ? { [key]: value } : {})
        }),
        set: vi.fn((items: Record<string, unknown>) => {
          Object.assign(mockStore, items)
          return Promise.resolve()
        }),
        remove: vi.fn((keys: string | string[]) => {
          const keyList = Array.isArray(keys) ? keys : [keys]
          keyList.forEach((k) => delete mockStore[k])
          return Promise.resolve()
        }),
      },
    },
  }
})

afterEach(() => {
  delete (globalThis as unknown as Record<string, unknown>).chrome
  delete (globalThis as unknown as Record<string, unknown>).fetch
})

describe('extractArticleImages metadata', () => {
  it('computes imageCount as number of kept images', () => {
    const doc = createDocument(`
      <img src="https://example.com/a.jpg" alt="A" />
      <img src="https://example.com/b.jpg" alt="B" />
      <img src="https://example.com/c.jpg" alt="C" />
    `)
    const result = extractArticleImages(doc)
    expect(result.images.length).toBe(3)
    expect(result.images[0].url).toBe('https://example.com/a.jpg')
  })

  it('computes skippedImageCount for noise images', () => {
    const doc = createDocument(`
      <img src="https://example.com/photo.jpg" width="800" height="600" />
      <img src="https://example.com/1x1.gif" width="1" height="1" />
      <img src="data:image/png;base64,iVBORw0K" />
      <img class="avatar" src="https://example.com/user.png" />
    `)
    const result = extractArticleImages(doc)
    expect(result.stats.totalFound).toBe(4)
    expect(result.stats.kept).toBe(1)
    expect(result.stats.skipped).toBe(3)
    expect(result.skipped.length).toBe(3)
  })

  it('firstImageUrl is the first kept image URL', () => {
    const doc = createDocument(`
      <img src="https://example.com/first.jpg" width="800" height="600" />
      <img src="https://example.com/second.jpg" width="800" height="600" />
    `)
    const result = extractArticleImages(doc)
    expect(result.images[0]?.url).toBe('https://example.com/first.jpg')
  })

  it('firstImageUrl is undefined for page with no valid images', () => {
    const doc = createDocument(`
      <img src="data:image/png;base64,iVBORw0K" />
      <img class="avatar" src="https://example.com/user.png" />
    `)
    const result = extractArticleImages(doc)
    expect(result.images).toHaveLength(0)
    expect(result.images[0]?.url).toBeUndefined()
  })

  it('imageCount is 0 for page with no images', () => {
    const doc = createDocument('<article><p>No images here</p></article>')
    const result = extractArticleImages(doc)
    expect(result.images.length).toBe(0)
    expect(result.stats.totalFound).toBe(0)
    expect(result.stats.kept).toBe(0)
    expect(result.stats.skipped).toBe(0)
  })
})

describe('buildHistoryInput image metadata', () => {
  it('includes imageCount from draft content', () => {
    const draft = makeDraft({ imageCount: 3, firstImageUrl: 'https://example.com/a.jpg', skippedImageCount: 1 })
    const result = buildHistoryInput(draft)
    expect(result.imageCount).toBe(3)
    expect(result.firstImageUrl).toBe('https://example.com/a.jpg')
    expect(result.skippedImageCount).toBe(1)
  })

  it('imageCount is undefined when not set on content', () => {
    const draft = makeDraft()
    const result = buildHistoryInput(draft)
    expect(result.imageCount).toBeUndefined()
    expect(result.firstImageUrl).toBeUndefined()
    expect(result.skippedImageCount).toBeUndefined()
  })

  it('imageCount is 0 for selection mode draft', () => {
    const draft = makeDraft({ mode: 'selection', imageCount: 0, skippedImageCount: 0 })
    const result = buildHistoryInput(draft)
    expect(result.imageCount).toBe(0)
    expect(result.firstImageUrl).toBeUndefined()
    expect(result.skippedImageCount).toBe(0)
  })
})

describe('handleSaveToNotion image metadata history', () => {
  it('stores image metadata in history on successful save', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    const draft = makeDraft({
      imageCount: 3,
      firstImageUrl: 'https://example.com/photo.jpg',
      skippedImageCount: 1,
    })

    await handleSaveToNotion(makePayload({ draft }))

    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      imageCount: 3,
      firstImageUrl: 'https://example.com/photo.jpg',
      skippedImageCount: 1,
      saveStatus: 'saved',
    })
  })

  it('stores image metadata in history on failed save', async () => {
    mockFetch(500)
    setRawSettings(makeSettings())

    const draft = makeDraft({
      imageCount: 5,
      firstImageUrl: 'https://example.com/img.jpg',
      skippedImageCount: 2,
    })

    await handleSaveToNotion(makePayload({ draft }))

    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      imageCount: 5,
      firstImageUrl: 'https://example.com/img.jpg',
      skippedImageCount: 2,
      saveStatus: 'failed',
    })
  })

  it('history item has no imageCount when content has none', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    await handleSaveToNotion(makePayload())

    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0].imageCount).toBeUndefined()
    expect(history[0].firstImageUrl).toBeUndefined()
    expect(history[0].skippedImageCount).toBeUndefined()
  })

  it('history item has imageCount 0 for selection with no images', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    const draft = makeDraft({
      mode: 'selection',
      imageCount: 0,
      skippedImageCount: 0,
    })

    await handleSaveToNotion(makePayload({ draft }))

    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0].imageCount).toBe(0)
    expect(history[0].firstImageUrl).toBeUndefined()
    expect(history[0].skippedImageCount).toBe(0)
  })

  it('image metadata is preserved during retry update (merge)', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    const draft = makeDraft({
      imageCount: 4,
      firstImageUrl: 'https://example.com/initial.jpg',
      skippedImageCount: 1,
    })

    await handleSaveToNotion(makePayload({ draft }))

    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0].imageCount).toBe(4)
    expect(history[0].firstImageUrl).toBe('https://example.com/initial.jpg')
    expect(history[0].skippedImageCount).toBe(1)

    const itemId = history[0].id

    mockFetch(200)
    const retryPayload = makePayload({ draft })
    await handleSaveToNotion({
      ...retryPayload,
      sourceHistoryId: itemId,
      historyWriteMode: 'update',
    })

    const updatedHistory = getHistory()
    expect(updatedHistory).toHaveLength(1)
    expect(updatedHistory[0].imageCount).toBe(4)
    expect(updatedHistory[0].firstImageUrl).toBe('https://example.com/initial.jpg')
    expect(updatedHistory[0].skippedImageCount).toBe(1)
    expect(updatedHistory[0].saveStatus).toBe('saved')
  })
})

describe('image metadata type safety', () => {
  it('firstImageUrl is not a long text blob', () => {
    const result = extractArticleImages(
      createDocument(`<img src="https://example.com/photo.jpg" width="800" height="600" />`),
    )
    expect(result.images[0]?.url).toBe('https://example.com/photo.jpg')
    expect(result.images[0]?.url.length).toBeLessThan(100)
  })

  it('imageCount is a safe integer', () => {
    const result = extractArticleImages(
      createDocument(`<img src="https://example.com/a.jpg" /><img src="https://example.com/b.jpg" />`),
    )
    expect(Number.isSafeInteger(result.images.length)).toBe(true)
    expect(result.images.length).toBe(2)
  })

  it('does not record all image URLs in history metadata', () => {
    const doc = createDocument(
      Array.from({ length: 10 }, (_, i) =>
        `<img src="https://example.com/img${i}.jpg" width="800" height="600" />`
      ).join(''),
    )
    const result = extractArticleImages(doc)
    expect(result.images.length).toBe(10)
    expect(result.images[0]?.url).toBeDefined()
    expect(result.images[0]?.url).toBe('https://example.com/img0.jpg')
  })
})

describe('image metadata selection safety', () => {
  it('selection mode draft does not show fullpage image counts', () => {
    const draft = makeDraft({ mode: 'selection', imageCount: 0, skippedImageCount: 0 })
    const result = buildHistoryInput(draft)
    expect(result.imageCount).toBe(0)
    expect(result.firstImageUrl).toBeUndefined()
    expect(result.skippedImageCount).toBe(0)
    expect(result.mode).toBe('selection')
  })

  it('fullpage draft shows image metadata correctly', () => {
    const draft = makeDraft({
      mode: 'fullpage',
      imageCount: 3,
      firstImageUrl: 'https://example.com/img.jpg',
      skippedImageCount: 1,
    })
    const result = buildHistoryInput(draft)
    expect(result.imageCount).toBe(3)
    expect(result.firstImageUrl).toBe('https://example.com/img.jpg')
    expect(result.skippedImageCount).toBe(1)
    expect(result.mode).toBe('fullpage')
  })
})
