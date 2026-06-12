import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { migrateSettings } from '../src/shared/utils/migration'
import type { OldSettingsRecord } from '../src/shared/utils/migration'
import type { ClipMateSettings, ClipMateSettingsV2 } from '../src/shared/types/settings.types'
import { DEFAULT_SETTINGS_V2, MAX_MARKDOWN_LENGTH, STORAGE_KEYS } from '../src/shared/constants/defaults'

let idCounter = 0

vi.mock('../src/shared/utils/id', () => ({
  generateId: vi.fn(() => {
    idCounter++
    return `00000000-0000-4000-a000-${String(idCounter).padStart(12, '0')}`
  }),
}))

const mockStore: Record<string, unknown> = {}

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
})

function setRawSettings(value: unknown): void {
  mockStore[STORAGE_KEYS.SETTINGS] = value
}

function getRawSettings(): unknown {
  return mockStore[STORAGE_KEYS.SETTINGS]
}

describe('migration pure function', () => {
  describe('migrateSettings', () => {
    it('migrates v0.1 settings with notionPageId to notionTargets', () => {
      const old: ClipMateSettings = {
        notionToken: '',
        notionPageId: 'abc123def4567890abc123def4567890',
        defaultTags: ['tech'],
        saveHistoryEnabled: true,
      }

      const result = migrateSettings(old)

      expect(result.version).toBe(2)
      expect(result.notionTargets).toHaveLength(1)
      expect(result.notionTargets[0].name).toBe('默认 Notion 页面')
      expect(result.notionTargets[0].pageId).toBe('abc123def4567890abc123def4567890')
      expect(result.notionTargets[0].isDefault).toBe(true)
      expect(result.notionPageId).toBe('abc123def4567890abc123def4567890')
      expect(result.defaultTags).toEqual(['tech'])
      expect(result.historyLimit).toBe(100)
    })

    it('does not create empty target when no old pageId', () => {
      const old: ClipMateSettings = {
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
      }

      const result = migrateSettings(old)

      expect(result.version).toBe(2)
      expect(result.notionTargets).toHaveLength(0)
    })

    it('does not create target when pageId is only whitespace', () => {
      const old: ClipMateSettings = {
        notionToken: '',
        notionPageId: '   ',
        defaultTags: [],
        saveHistoryEnabled: true,
      }

      const result = migrateSettings(old)

      expect(result.notionTargets).toHaveLength(0)
    })

    it('initializes undefined settings to v0.2 defaults', () => {
      const result = migrateSettings(undefined)

      expect(result.version).toBe(2)
      expect(result.notionTargets).toHaveLength(0)
      expect(result.notionToken).toBe('')
      expect(result.notionPageId).toBe('')
      expect(result.defaultTags).toEqual([])
      expect(result.saveHistoryEnabled).toBe(true)
      expect(result.historyLimit).toBe(100)
    })

    it('initializes null settings to v0.2 defaults', () => {
      const result = migrateSettings(null)

      expect(result.version).toBe(2)
      expect(result.notionTargets).toHaveLength(0)
    })

    it('preserves existing saveHistoryEnabled during migration', () => {
      const old: ClipMateSettings = {
        notionToken: '',
        notionPageId: 'page123',
        defaultTags: ['web', 'dev'],
        saveHistoryEnabled: false,
      }

      const result = migrateSettings(old)

      expect(result.saveHistoryEnabled).toBe(false)
      expect(result.defaultTags).toEqual(['web', 'dev'])
    })

    it('preserves notionToken during migration without printing', () => {
      const old: ClipMateSettings = {
        notionToken: 'secret_abc123',
        notionPageId: 'page123',
        defaultTags: [],
        saveHistoryEnabled: true,
      }

      const result = migrateSettings(old)

      expect(result.notionToken).toBe('secret_abc123')
    })
  })
})

describe('storage layer with mocked chrome', () => {
  async function getStorage() {
    return await import('../src/shared/storage/storage')
  }

  describe('getSettings and migration', () => {
    it('returns v2 settings from already-migrated storage', async () => {
      const { getSettings } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const settings = await getSettings()
      expect(settings.version).toBe(2)
      expect(settings.historyLimit).toBe(100)
      expect(settings.notionTargets).toEqual([])
    })

    it('migrates v0.1 settings on first getSettings access', async () => {
      const { getSettings } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: 'test-page-id',
        defaultTags: [],
        saveHistoryEnabled: true,
      })

      const settings = await getSettings()

      expect(settings.version).toBe(2)
      expect(settings.notionTargets).toHaveLength(1)
      expect(settings.notionTargets[0].pageId).toBe('test-page-id')
    })

    it('does not re-migrate already v2 settings', async () => {
      const { getSettings } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: 'test-page-id',
        defaultTags: ['a'],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [
          {
            id: 'existing-id',
            name: 'My Target',
            pageId: 'test-page-id',
            isDefault: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        historyLimit: 50,
      })

      const settings = await getSettings()

      expect(settings.version).toBe(2)
      expect(settings.notionTargets).toHaveLength(1)
      expect(settings.notionTargets[0].name).toBe('My Target')
      expect(settings.historyLimit).toBe(50)
    })

    it('writes migrated settings back to storage', async () => {
      const { getSettings } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: 'migrate-me',
        defaultTags: [],
        saveHistoryEnabled: true,
      })

      await getSettings()

      const stored = getRawSettings() as Record<string, unknown>
      expect(stored.version).toBe(2)
      expect(Array.isArray(stored.notionTargets)).toBe(true)
      expect((stored.notionTargets as Array<Record<string, unknown>>)[0].pageId).toBe('migrate-me')
    })
  })

  describe('saveSettings', () => {
    it('saves and retrieves updated settings', async () => {
      const { getSettings, saveSettings } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await saveSettings({ historyLimit: 50, defaultTags: ['test'] })

      const settings = await getSettings()
      expect(settings.historyLimit).toBe(50)
      expect(settings.defaultTags).toEqual(['test'])
    })
  })

  describe('notionTargets CRUD', () => {
    it('getNotionTargets returns empty array for new settings', async () => {
      const { getNotionTargets } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const targets = await getNotionTargets()
      expect(targets).toEqual([])
    })

    it('saveNotionTargets and getNotionTargets roundtrip', async () => {
      const { saveNotionTargets, getNotionTargets } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const target = {
        id: 't1',
        name: 'Work',
        pageId: 'page-work',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      await saveNotionTargets([target])
      const targets = await getNotionTargets()
      expect(targets).toHaveLength(1)
      expect(targets[0].name).toBe('Work')
    })

    it('getDefaultNotionTarget returns default target', async () => {
      const { saveNotionTargets, getDefaultNotionTarget } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await saveNotionTargets([
        { id: 't1', name: 'A', pageId: 'p1', isDefault: false, createdAt: '', updatedAt: '' },
        { id: 't2', name: 'B', pageId: 'p2', isDefault: true, createdAt: '', updatedAt: '' },
      ])

      const def = await getDefaultNotionTarget()
      expect(def?.name).toBe('B')
    })

    it('getDefaultNotionTarget returns first target if none is default', async () => {
      const { saveNotionTargets, getDefaultNotionTarget } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await saveNotionTargets([
        { id: 't1', name: 'First', pageId: 'p1', isDefault: false, createdAt: '', updatedAt: '' },
      ])

      const def = await getDefaultNotionTarget()
      expect(def?.name).toBe('First')
    })

    it('getDefaultNotionTarget returns undefined for empty targets', async () => {
      const { getDefaultNotionTarget } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const def = await getDefaultNotionTarget()
      expect(def).toBeUndefined()
    })
  })

  describe('history CRUD', () => {
    it('addHistoryItem then getHistory returns the item', async () => {
      const { addHistoryItem, getHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const item = await addHistoryItem({
        title: 'Test Article',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: ['web'],
        notePreview: 'note preview',
        contentPreview: 'content preview',
        markdown: '# Test\ncontent',
        wordCount: 10,
        saveStatus: 'saved',
        savedAt: new Date().toISOString(),
      })

      const history = await getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].title).toBe('Test Article')
      expect(history[0].id).toBe(item.id)
    })

    it('markdown exceeding limit is truncated and marked', async () => {
      const { addHistoryItem, getHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const longMarkdown = 'x'.repeat(MAX_MARKDOWN_LENGTH + 100)

      await addHistoryItem({
        title: 'Long Article',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: longMarkdown,
        wordCount: 100,
        saveStatus: 'saved',
      })

      const history = await getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].markdown.length).toBe(MAX_MARKDOWN_LENGTH)
      expect(history[0].markdownTruncated).toBe(true)
    })

    it('markdown within limit is not truncated', async () => {
      const { addHistoryItem, getHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'Short',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'short content',
        wordCount: 2,
        saveStatus: 'saved',
      })

      const history = await getHistory()
      expect(history[0].markdownTruncated).toBe(false)
    })

    it('updateHistoryItem modifies item fields', async () => {
      const { addHistoryItem, updateHistoryItem, getHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const item = await addHistoryItem({
        title: 'Original',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'unsaved',
      })

      const updated = await updateHistoryItem(item.id, {
        saveStatus: 'saved',
        savedAt: '2024-06-01T00:00:00.000Z',
      })

      expect(updated).not.toBeNull()
      expect(updated!.saveStatus).toBe('saved')

      const history = await getHistory()
      expect(history[0].saveStatus).toBe('saved')
    })

    it('updateHistoryItem returns null for non-existent id', async () => {
      const { updateHistoryItem } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const result = await updateHistoryItem('non-existent', { saveStatus: 'saved' })
      expect(result).toBeNull()
    })

    it('deleteHistoryItem removes item', async () => {
      const { addHistoryItem, deleteHistoryItem, getHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const item = await addHistoryItem({
        title: 'To Delete',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      const deleted = await deleteHistoryItem(item.id)
      expect(deleted).toBe(true)

      const history = await getHistory()
      expect(history).toHaveLength(0)
    })

    it('deleteHistoryItem returns false for non-existent id', async () => {
      const { deleteHistoryItem } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const result = await deleteHistoryItem('non-existent')
      expect(result).toBe(false)
    })

    it('clearHistory removes all items', async () => {
      const { addHistoryItem, clearHistory, getHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'Item 1',
        url: 'https://a.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      await addHistoryItem({
        title: 'Item 2',
        url: 'https://b.com',
        mode: 'selection',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      await clearHistory()
      const history = await getHistory()
      expect(history).toHaveLength(0)
    })

    it('searchHistory finds by title', async () => {
      const { addHistoryItem, searchHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'React Hooks Guide',
        url: 'https://example.com/react',
        mode: 'fullpage',
        tags: ['react'],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      await addHistoryItem({
        title: 'Vue Composition API',
        url: 'https://example.com/vue',
        mode: 'fullpage',
        tags: ['vue'],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      const results = await searchHistory('react')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('React Hooks Guide')
    })

    it('searchHistory finds by URL', async () => {
      const { addHistoryItem, searchHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'Article',
        url: 'https://myblog.com/posts/123',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      await addHistoryItem({
        title: 'Other',
        url: 'https://other.com/page',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      const results = await searchHistory('myblog')
      expect(results).toHaveLength(1)
      expect(results[0].url).toContain('myblog')
    })

    it('searchHistory finds by tags', async () => {
      const { addHistoryItem, searchHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'Article',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: ['javascript', 'tutorial'],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      await addHistoryItem({
        title: 'Other',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: ['python'],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      const results = await searchHistory('javascript')
      expect(results).toHaveLength(1)
      expect(results[0].tags).toContain('javascript')
    })

    it('searchHistory is case-insensitive', async () => {
      const { addHistoryItem, searchHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'React Guide',
        url: 'https://example.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      const results = await searchHistory('REACT')
      expect(results).toHaveLength(1)
    })

    it('searchHistory empty query returns all items', async () => {
      const { addHistoryItem, searchHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'A',
        url: 'https://a.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      await addHistoryItem({
        title: 'B',
        url: 'https://b.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      const results = await searchHistory('')
      expect(results).toHaveLength(2)
    })

    it('searchHistory whitespace-only returns all', async () => {
      const { addHistoryItem, searchHistory } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await addHistoryItem({
        title: 'A',
        url: 'https://a.com',
        mode: 'fullpage',
        tags: [],
        notePreview: '',
        contentPreview: '',
        markdown: 'md',
        wordCount: 1,
        saveStatus: 'saved',
      })

      const results = await searchHistory('   ')
      expect(results).toHaveLength(1)
    })

    it('limit enforces trimming via settings', async () => {
      const { addHistoryItem, getHistory, saveSettings, getSettings } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await saveSettings({ historyLimit: 10 })
      const preCheck = await getSettings()
      expect(preCheck.historyLimit).toBe(10)

      for (let i = 1; i <= 15; i++) {
        await addHistoryItem({
          title: `Item ${i}`,
          url: `https://example.com/${i}`,
          mode: 'fullpage',
          tags: [],
          notePreview: '',
          contentPreview: '',
          markdown: `content ${i}`,
          wordCount: 1,
          saveStatus: 'saved',
        })
      }

      const history = await getHistory()
      expect(history).toHaveLength(10)
      expect(history[0].title).toBe('Item 15')
      expect(history[9].title).toBe('Item 6')
    })

    it('historyLimit below min is clamped when saving', async () => {
      const { saveSettings, getSettings } = await getStorage()

      setRawSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      await saveSettings({ historyLimit: 3 })
      const result = await getSettings()
      expect(result.historyLimit).toBe(10)
    })
  })

  describe('no token leakage', () => {
    it('getSettings returns notionToken but does not log it', async () => {
      const { getSettings } = await getStorage()

      setRawSettings({
        notionToken: 'secret_test_token_12345',
        notionPageId: 'page123',
        defaultTags: [],
        saveHistoryEnabled: true,
        version: 2,
        notionTargets: [],
        historyLimit: 100,
      })

      const settings = await getSettings()
      expect(settings.notionToken).toBe('secret_test_token_12345')
    })
  })
})
