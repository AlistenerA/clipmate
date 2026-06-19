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

function mockFetch(status: number) {
  ;(globalThis as unknown as Record<string, unknown>).fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve({}),
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
  return {
    draft: makeDraft(),
    targetId: 'target-1',
    targetName: 'Test Target',
    pageId: 'abc123def4567890abc123def4567890',
    ...overrides,
  }
}

function setRawSettings(settings: ClipMateSettingsV2): void {
  mockStore[STORAGE_KEYS.SETTINGS] = settings
}

function setHistory(items: unknown[]): void {
  mockStore[STORAGE_KEYS.HISTORY] = items
}

function getHistory(): unknown[] {
  return (mockStore[STORAGE_KEYS.HISTORY] as unknown[] | undefined) ?? []
}

function seedHistoryItem(id: string): void {
  const item = {
    id,
    title: 'Existing Item',
    url: 'https://example.com',
    mode: 'fullpage',
    tags: ['old'],
    notePreview: 'old note',
    contentPreview: 'old content',
    markdown: '# Old\n\n---\n\nold body',
    markdownTruncated: false,
    wordCount: 3,
    targetId: 'target-old',
    targetName: 'Old Target',
    saveStatus: 'failed',
    errorCode: 'NETWORK_ERROR',
    createdAt: '2026-06-11T09:00:00.000Z',
    updatedAt: '2026-06-11T09:00:00.000Z',
  }
  setHistory([item])
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

describe('handleSaveToNotion retry update mode', () => {
  it('updates existing history on retry success without adding new item', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())
    seedHistoryItem('history-retry-1')

    const payload = makePayload({
      targetId: 'target-1',
      targetName: 'Retry Target',
      pageId: 'abc123def4567890abc123def4567890',
      sourceHistoryId: 'history-retry-1',
      historyWriteMode: 'update',
    })

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(true)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      id: 'history-retry-1',
      saveStatus: 'saved',
      targetId: 'target-1',
      targetName: 'Retry Target',
    })
    expect((history[0] as Record<string, unknown>).savedAt).toBeDefined()
    expect((history[0] as Record<string, unknown>).errorCode).toBeUndefined()
  })

  it('updates existing history on retry failure without adding new item', async () => {
    mockFetch(401)
    setRawSettings(makeSettings())
    seedHistoryItem('history-retry-2')

    const payload = makePayload({
      sourceHistoryId: 'history-retry-2',
      historyWriteMode: 'update',
    })

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(false)
    expect(result.error).toBe('NOTION_AUTH_FAILED')
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      id: 'history-retry-2',
      saveStatus: 'failed',
      errorCode: 'NOTION_AUTH_FAILED|B1|HTTP401',
    })
  })

  it('normal save still adds new history when no sourceHistoryId', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())
    setHistory([])

    const payload = makePayload({})

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(true)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect((history[0] as Record<string, unknown>).id).toBe(
      '00000000-0000-4000-a000-000000000001',
    )
    expect(history[0]).toMatchObject({
      saveStatus: 'saved',
    })
  })

  it('normal save still adds new history on failure when no sourceHistoryId', async () => {
    mockFetch(500)
    setRawSettings(makeSettings())
    setHistory([])

    const payload = makePayload({})

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(false)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect((history[0] as Record<string, unknown>).id).toBe(
      '00000000-0000-4000-a000-000000000001',
    )
    expect(history[0]).toMatchObject({
      saveStatus: 'failed',
    })
  })

  it('retry update honors saveHistoryEnabled=false', async () => {
    mockFetch(200)
    setRawSettings(makeSettings({ saveHistoryEnabled: false }))
    seedHistoryItem('history-retry-3')

    const payload = makePayload({
      sourceHistoryId: 'history-retry-3',
      historyWriteMode: 'update',
    })

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(true)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      id: 'history-retry-3',
      saveStatus: 'saved',
    })
  })

  it('retry returns error when token is missing', async () => {
    setRawSettings(makeSettings({ notionToken: '' }))
    seedHistoryItem('history-retry-4')

    const payload = makePayload({
      sourceHistoryId: 'history-retry-4',
      historyWriteMode: 'update',
    })

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(false)
    expect(result.error).toBe('NOTION_TOKEN_MISSING')
  })

  it('retry returns error when pageId is empty', async () => {
    setRawSettings(makeSettings())

    const payload = makePayload({
      pageId: '',
      sourceHistoryId: 'history-retry-5',
      historyWriteMode: 'update',
    })

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(false)
    expect(result.error).toBe('NOTION_PAGE_ID_MISSING')
  })

  it('retry returns error when content is empty', async () => {
    setRawSettings(makeSettings())

    const draft: ClipDraft = {
      title: '',
      tags: [],
      note: '',
      mode: 'fullpage',
      content: {
        mode: 'fullpage',
        title: '',
        url: '',
        description: '',
        contentText: '',
        contentHtml: '',
        markdown: '',
        wordCount: 0,
        metadata: { url: '', title: '', description: '', siteName: '', createdAt: '' },
      } as ExtractedContent,
    }

    const payload = makePayload({
      draft,
      sourceHistoryId: 'history-retry-6',
      historyWriteMode: 'update',
    })

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(false)
    expect(result.error).toBe('CONTENT_EMPTY')
  })

  it('append mode still adds new history even with sourceHistoryId', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())
    seedHistoryItem('history-retry-7')

    const payload = makePayload({
      sourceHistoryId: 'history-retry-7',
      historyWriteMode: 'append',
    })

    const result = await handleSaveToNotion(payload)

    expect(result.success).toBe(true)
    const history = getHistory()
    expect(history).toHaveLength(2)
    const newItem = history.find((h) =>
      typeof (h as Record<string, unknown>).id === 'string'
      && (h as Record<string, unknown>).id !== 'history-retry-7'
    )
    expect(newItem).toBeDefined()
  })

  it('retry success clears errorCode', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())
    seedHistoryItem('history-retry-8')

    const payload = makePayload({
      sourceHistoryId: 'history-retry-8',
      historyWriteMode: 'update',
    })

    await handleSaveToNotion(payload)

    const history = getHistory()
    expect(history[0]).toMatchObject({
      saveStatus: 'saved',
      errorCode: undefined,
    })
  })

  it('retry updates updatedAt timestamp', async () => {
    mockFetch(200)
    setRawSettings(makeSettings())
    seedHistoryItem('history-retry-9')

    const payload = makePayload({
      sourceHistoryId: 'history-retry-9',
      historyWriteMode: 'update',
    })

    await handleSaveToNotion(payload)

    const history = getHistory()
    const item = history[0] as Record<string, unknown>
    expect(item.updatedAt).not.toBe('2026-06-11T09:00:00.000Z')
  })
})
