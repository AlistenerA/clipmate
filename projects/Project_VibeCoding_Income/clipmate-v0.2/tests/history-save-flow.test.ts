import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ClipMateSettingsV2, NotionTarget } from '../src/shared/types/settings.types'
import type { ClipDraft, ExtractedContent } from '../src/shared/types/clip.types'
import type { SaveToNotionPayload } from '../src/shared/types/message.types'
import { handleSaveToNotion } from '../src/background/handlers/notionHandler'
import { DEFAULT_SETTINGS_V2, STORAGE_KEYS } from '../src/shared/constants/defaults'

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

function makeDraft(): ClipDraft {
  return {
    title: 'Test Page',
    tags: ['test'],
    note: 'some note',
    mode: 'fullpage',
    content: {
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
    } as ExtractedContent,
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

function getHistory(): unknown[] {
  return (mockStore[STORAGE_KEYS.HISTORY] as unknown[] | undefined) ?? []
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

describe('handleSaveToNotion', () => {
  it('returns error when token is missing', async () => {
    setRawSettings(makeSettings({ notionToken: '' }))
    const result = await handleSaveToNotion(makePayload())
    expect(result.success).toBe(false)
    expect(result.error).toBe('NOTION_TOKEN_MISSING')
  })

  it('returns error when pageId is empty', async () => {
    setRawSettings(makeSettings())
    const result = await handleSaveToNotion(makePayload({ pageId: '' }))
    expect(result.success).toBe(false)
    expect(result.error).toBe('NOTION_PAGE_ID_MISSING')
  })

  it('returns error when content is empty', async () => {
    setRawSettings(makeSettings())
    const draft: ClipDraft = {
      title: 'Empty Page',
      tags: [],
      note: '',
      mode: 'fullpage',
      content: {
        mode: 'fullpage',
        title: 'Empty Page',
        url: 'https://example.com',
        description: '',
        contentText: '',
        contentHtml: '',
        markdown: '',
        wordCount: 0,
        metadata: {
          url: 'https://example.com',
          title: 'Empty Page',
          description: '',
          siteName: '',
          createdAt: '',
        },
      } as ExtractedContent,
    }
    const result = await handleSaveToNotion(makePayload({ draft }))
    expect(result.success).toBe(false)
    expect(result.error).toBe('CONTENT_EMPTY')
  })

  it('saves successfully and writes history with saved status', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    const result = await handleSaveToNotion(makePayload())

    expect(result.success).toBe(true)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      title: 'Test Page',
      url: 'https://example.com',
      mode: 'fullpage',
      saveStatus: 'saved',
      targetId: 'target-1',
      targetName: 'Test Target',
    })
    expect((history[0] as Record<string, unknown>).savedAt).toBeDefined()
    expect((history[0] as Record<string, unknown>).errorCode).toBeUndefined()
  })

  it('does not write history when saveHistoryEnabled is false', async () => {
    mockFetch(200)
    setRawSettings(makeSettings({ saveHistoryEnabled: false }))

    await handleSaveToNotion(makePayload())

    const history = getHistory()
    expect(history).toHaveLength(0)
  })

  it('writes history with failed status on Notion API error', async () => {
    mockFetch(401)
    setRawSettings(makeSettings())

    const result = await handleSaveToNotion(makePayload())

    expect(result.success).toBe(false)
    expect(result.error).toBe('NOTION_AUTH_FAILED')
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      saveStatus: 'failed',
      errorCode: 'NOTION_AUTH_FAILED',
      targetId: 'target-1',
      targetName: 'Test Target',
    })
  })

  it('does not write history on failed when saveHistoryEnabled is false', async () => {
    mockFetch(500)
    setRawSettings(makeSettings({ saveHistoryEnabled: false }))

    await handleSaveToNotion(makePayload())

    const history = getHistory()
    expect(history).toHaveLength(0)
  })

  it('writes history with failed status on network error', async () => {
    ;(globalThis as unknown as Record<string, unknown>).fetch = vi.fn(() =>
      Promise.reject(new Error('NETWORK_ERROR'))
    ) as unknown as typeof fetch
    setRawSettings(makeSettings())

    const result = await handleSaveToNotion(makePayload())

    expect(result.success).toBe(false)
    expect(result.error).toBe('NETWORK_ERROR')
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      saveStatus: 'failed',
      errorCode: 'NETWORK_ERROR',
    })
  })

  it('uses pageId from payload not from settings', async () => {
    mockFetch(200)
    const payload = makePayload({
      pageId: 'custom-page-id-123456789012345678901234',
    })
    setRawSettings(makeSettings({
      notionPageId: 'old-page-id-that-should-not-be-used',
    }))

    const result = await handleSaveToNotion(payload)
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('writes history without targetId/targetName when not provided', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    const result = await handleSaveToNotion(makePayload({
      targetId: undefined,
      targetName: undefined,
    }))

    expect(result.success).toBe(true)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      targetId: undefined,
      targetName: undefined,
      saveStatus: 'saved',
    })
  })

  it('writes failed history without targetId/targetName when not provided', async () => {
    mockFetch(404)
    setRawSettings(makeSettings())

    const result = await handleSaveToNotion(makePayload({
      targetId: undefined,
      targetName: undefined,
    }))

    expect(result.success).toBe(false)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      targetId: undefined,
      targetName: undefined,
      saveStatus: 'failed',
    })
  })

  it('writes history with markdown formatted via formatCopyMarkdown', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    const payload = makePayload()
    await handleSaveToNotion(payload)

    const history = getHistory()
    expect(history).toHaveLength(1)
    const item = history[0] as Record<string, unknown>
    const markdown = item.markdown as string
    expect(markdown).toContain('# Test Page')
    expect(markdown).toContain('https://example.com')
    expect(markdown).toContain('#test')
  })

  it('marks markdownTruncated when markdown exceeds limit', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())

    const longMarkdown = '# Test\n\n' + 'A'.repeat(50100)
    const draft = makeDraft()
    draft.content.markdown = longMarkdown

    await handleSaveToNotion(makePayload({ draft }))

    const history = getHistory()
    expect(history).toHaveLength(1)
    const item = history[0] as Record<string, unknown>
    expect(item.markdownTruncated).toBe(true)
  })
})
