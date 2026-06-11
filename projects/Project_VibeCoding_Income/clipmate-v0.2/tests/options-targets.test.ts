import { describe, it, expect } from 'vitest'
import {
  addTarget,
  updateTarget,
  deleteTarget,
  setDefaultTarget,
  maskPageId,
} from '../src/options/utils/targetManager'
import type { NotionTarget } from '../src/shared/types/settings.types'

function makeTarget(overrides: Partial<NotionTarget> = {}): NotionTarget {
  return {
    id: overrides.id ?? 'target-1',
    name: overrides.name ?? 'Test Target',
    pageId: overrides.pageId ?? 'abc123def4567890abc123def4567890',
    isDefault: overrides.isDefault ?? false,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    lastUsedAt: overrides.lastUsedAt,
  }
}

describe('addTarget', () => {
  it('adds first target and auto-sets as default', () => {
    const result = addTarget([], 'Work', 'page-work')
    expect(result.targets).toHaveLength(1)
    expect(result.targets[0].name).toBe('Work')
    expect(result.targets[0].pageId).toBe('page-work')
    expect(result.targets[0].isDefault).toBe(true)
    expect(result.newTarget.isDefault).toBe(true)
  })

  it('adds second target without overriding default', () => {
    const t1 = makeTarget({ id: 't1', name: 'First', isDefault: true })
    const result = addTarget([t1], 'Second', 'page-2')
    expect(result.targets).toHaveLength(2)
    expect(result.targets[0].isDefault).toBe(true)
    expect(result.targets[1].isDefault).toBe(false)
  })

  it('adds target with makeDefault=true overrides previous default', () => {
    const t1 = makeTarget({ id: 't1', name: 'First', isDefault: true })
    const result = addTarget([t1], 'Second', 'page-2', true)
    expect(result.targets).toHaveLength(2)
    expect(result.targets.find((t) => t.name === 'First')?.isDefault).toBe(false)
    expect(result.targets.find((t) => t.name === 'Second')?.isDefault).toBe(true)
  })

  it('trims name and pageId before saving', () => {
    const result = addTarget([], '  Work  ', '  page-work  ')
    expect(result.targets[0].name).toBe('Work')
    expect(result.targets[0].pageId).toBe('page-work')
  })

  it('throws when name is empty', () => {
    expect(() => addTarget([], '', 'page-1')).toThrow('名称和 Page ID 不能为空')
  })

  it('throws when name is only whitespace', () => {
    expect(() => addTarget([], '   ', 'page-1')).toThrow('名称和 Page ID 不能为空')
  })

  it('throws when pageId is empty', () => {
    expect(() => addTarget([], 'Name', '')).toThrow('名称和 Page ID 不能为空')
  })

  it('throws when pageId is only whitespace', () => {
    expect(() => addTarget([], 'Name', '   ')).toThrow('名称和 Page ID 不能为空')
  })

  it('sets createdAt and updatedAt', () => {
    const before = new Date().toISOString()
    const result = addTarget([], 'Work', 'page-work')
    const after = new Date().toISOString()
    expect(result.targets[0].createdAt).toBeTruthy()
    expect(result.targets[0].createdAt).toBe(result.targets[0].updatedAt)
    expect(result.targets[0].createdAt >= before).toBe(true)
    expect(result.targets[0].createdAt <= after).toBe(true)
  })

  it('does not modify notionToken', () => {
    const result = addTarget([], 'Work', 'page-work')
    expect((result.targets[0] as Record<string, unknown>).notionToken).toBeUndefined()
  })
})

describe('updateTarget', () => {
  it('updates name and pageId', () => {
    const t1 = makeTarget({ id: 't1', name: 'Old Name', pageId: 'old-page' })
    const result = updateTarget([t1], 't1', 'New Name', 'new-page')
    expect(result[0].name).toBe('New Name')
    expect(result[0].pageId).toBe('new-page')
  })

  it('trims name and pageId before updating', () => {
    const t1 = makeTarget({ id: 't1', name: 'Old', pageId: 'old-page' })
    const result = updateTarget([t1], 't1', '  New  ', '  new-page  ')
    expect(result[0].name).toBe('New')
    expect(result[0].pageId).toBe('new-page')
  })

  it('preserves id and createdAt', () => {
    const t1 = makeTarget({ id: 't1', name: 'Old', createdAt: '2025-01-01T00:00:00.000Z' })
    const result = updateTarget([t1], 't1', 'New', 'new-page')
    expect(result[0].id).toBe('t1')
    expect(result[0].createdAt).toBe('2025-01-01T00:00:00.000Z')
  })

  it('updates updatedAt', () => {
    const t1 = makeTarget({ id: 't1', name: 'Old', updatedAt: '2025-01-01T00:00:00.000Z' })
    const result = updateTarget([t1], 't1', 'New', 'new-page')
    expect(result[0].updatedAt).not.toBe('2025-01-01T00:00:00.000Z')
  })

  it('preserves isDefault status', () => {
    const t1 = makeTarget({ id: 't1', name: 'Old', isDefault: true })
    const result = updateTarget([t1], 't1', 'New', 'new-page')
    expect(result[0].isDefault).toBe(true)
  })

  it('throws when target id not found', () => {
    const t1 = makeTarget({ id: 't1' })
    expect(() => updateTarget([t1], 'non-existent', 'Name', 'page')).toThrow('目标不存在')
  })

  it('throws when name is empty after trim', () => {
    const t1 = makeTarget({ id: 't1' })
    expect(() => updateTarget([t1], 't1', '  ', 'page')).toThrow('名称和 Page ID 不能为空')
  })

  it('does not modify other targets', () => {
    const t1 = makeTarget({ id: 't1', name: 'First' })
    const t2 = makeTarget({ id: 't2', name: 'Second' })
    const result = updateTarget([t1, t2], 't1', 'Updated', 'page-updated')
    expect(result[1].name).toBe('Second')
  })
})

describe('deleteTarget', () => {
  it('deletes non-default target without changing default', () => {
    const t1 = makeTarget({ id: 't1', name: 'Default', isDefault: true })
    const t2 = makeTarget({ id: 't2', name: 'Other', isDefault: false })
    const result = deleteTarget([t1, t2], 't2')
    expect(result.targets).toHaveLength(1)
    expect(result.targets[0].name).toBe('Default')
    expect(result.targets[0].isDefault).toBe(true)
  })

  it('deletes default target and promotes first remaining as default', () => {
    const t1 = makeTarget({ id: 't1', name: 'Default', isDefault: true })
    const t2 = makeTarget({ id: 't2', name: 'Other', isDefault: false })
    const result = deleteTarget([t1, t2], 't1')
    expect(result.targets).toHaveLength(1)
    expect(result.targets[0].name).toBe('Other')
    expect(result.targets[0].isDefault).toBe(true)
    expect(result.newDefaultId).toBe('t2')
  })

  it('deletes last target and clears defaultTargetId', () => {
    const t1 = makeTarget({ id: 't1', name: 'Last', isDefault: true })
    const result = deleteTarget([t1], 't1')
    expect(result.targets).toHaveLength(0)
    expect(result.newDefaultId).toBeUndefined()
  })

  it('throws when target id not found', () => {
    const t1 = makeTarget({ id: 't1' })
    expect(() => deleteTarget([t1], 'non-existent')).toThrow('目标不存在')
  })

  it('ensures only one isDefault after deletion', () => {
    const t1 = makeTarget({ id: 't1', name: 'Default', isDefault: true })
    const t2 = makeTarget({ id: 't2', name: 'Other', isDefault: false })
    const result = deleteTarget([t1, t2], 't1')
    const defaults = result.targets.filter((t) => t.isDefault)
    expect(defaults).toHaveLength(1)
  })

  it('keeps existing default when deleting non-default among many', () => {
    const t1 = makeTarget({ id: 't1', name: 'Default', isDefault: true })
    const t2 = makeTarget({ id: 't2', name: 'Second', isDefault: false })
    const t3 = makeTarget({ id: 't3', name: 'Third', isDefault: false })
    const result = deleteTarget([t1, t2, t3], 't2')
    expect(result.targets).toHaveLength(2)
    expect(result.targets.find((t) => t.id === 't1')?.isDefault).toBe(true)
  })

  it('returns newDefaultId matching the actual new default', () => {
    const t1 = makeTarget({ id: 't1', name: 'Default', isDefault: true })
    const t2 = makeTarget({ id: 't2', name: 'Second' })
    const result = deleteTarget([t1, t2], 't1')
    expect(result.newDefaultId).toBe(result.targets[0].id)
  })
})

describe('setDefaultTarget', () => {
  it('sets a non-default target as default', () => {
    const t1 = makeTarget({ id: 't1', name: 'First', isDefault: true })
    const t2 = makeTarget({ id: 't2', name: 'Second', isDefault: false })
    const result = setDefaultTarget([t1, t2], 't2')
    expect(result.find((t) => t.id === 't2')?.isDefault).toBe(true)
    expect(result.find((t) => t.id === 't1')?.isDefault).toBe(false)
  })

  it('ensures only one isDefault after setting', () => {
    const t1 = makeTarget({ id: 't1', name: 'First', isDefault: true })
    const t2 = makeTarget({ id: 't2', name: 'Second' })
    const result = setDefaultTarget([t1, t2], 't2')
    const defaults = result.filter((t) => t.isDefault)
    expect(defaults).toHaveLength(1)
  })

  it('setting already-default target is a no-op', () => {
    const t1 = makeTarget({ id: 't1', name: 'First', isDefault: true })
    const result = setDefaultTarget([t1], 't1')
    expect(result[0].isDefault).toBe(true)
  })

  it('throws when target id not found', () => {
    const t1 = makeTarget({ id: 't1' })
    expect(() => setDefaultTarget([t1], 'non-existent')).toThrow('目标不存在')
  })
})

describe('maskPageId', () => {
  it('returns placeholder for empty string', () => {
    expect(maskPageId('')).toBe('（未设置）')
  })

  it('shortens long pageId', () => {
    const result = maskPageId('abc123def4567890abc123def4567890')
    expect(result).toBe('abc123de...7890')
  })

  it('shortens short pageId without trailing chars', () => {
    const result = maskPageId('abc12345')
    expect(result).toBe('abc12345...')
  })
})
