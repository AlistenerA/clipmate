import type { NotionTarget } from '../../shared/types/settings.types'
import { generateId } from '../../shared/utils/id'

export function addTarget(
  targets: NotionTarget[],
  name: string,
  pageId: string,
  makeDefault?: boolean,
): { targets: NotionTarget[]; newTarget: NotionTarget } {
  const trimmedName = name.trim()
  const trimmedPageId = pageId.trim()

  if (!trimmedName || !trimmedPageId) {
    throw new Error('名称和 Page ID 不能为空')
  }

  const now = new Date().toISOString()
  const isFirst = targets.length === 0
  const shouldBeDefault = isFirst || makeDefault === true

  const newTarget: NotionTarget = {
    id: generateId(),
    name: trimmedName,
    pageId: trimmedPageId,
    isDefault: shouldBeDefault,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
  }

  const updatedTargets = shouldBeDefault
    ? targets.map((t) => ({ ...t, isDefault: false })).concat(newTarget)
    : [...targets, newTarget]

  return { targets: updatedTargets, newTarget }
}

export function updateTarget(
  targets: NotionTarget[],
  id: string,
  name: string,
  pageId: string,
): NotionTarget[] {
  const trimmedName = name.trim()
  const trimmedPageId = pageId.trim()

  if (!trimmedName || !trimmedPageId) {
    throw new Error('名称和 Page ID 不能为空')
  }

  const index = targets.findIndex((t) => t.id === id)
  if (index === -1) {
    throw new Error('目标不存在')
  }

  const now = new Date().toISOString()
  const updatedTargets = [...targets]
  updatedTargets[index] = {
    ...updatedTargets[index],
    name: trimmedName,
    pageId: trimmedPageId,
    updatedAt: now,
  }

  return updatedTargets
}

export function deleteTarget(
  targets: NotionTarget[],
  id: string,
): { targets: NotionTarget[]; newDefaultId?: string } {
  const targetToDelete = targets.find((t) => t.id === id)
  if (!targetToDelete) {
    throw new Error('目标不存在')
  }

  const remaining = targets.filter((t) => t.id !== id)

  if (targetToDelete.isDefault && remaining.length > 0) {
    const newDefault = { ...remaining[0], isDefault: true }
    const updatedRemaining = [newDefault, ...remaining.slice(1)]
    return { targets: updatedRemaining, newDefaultId: newDefault.id }
  }

  if (remaining.length === 0) {
    return { targets: [], newDefaultId: undefined }
  }

  return { targets: remaining, newDefaultId: remaining.find((t) => t.isDefault)?.id }
}

export function setDefaultTarget(
  targets: NotionTarget[],
  id: string,
): NotionTarget[] {
  const target = targets.find((t) => t.id === id)
  if (!target) {
    throw new Error('目标不存在')
  }

  if (target.isDefault) {
    return targets
  }

  return targets.map((t) => ({
    ...t,
    isDefault: t.id === id,
  }))
}

export function maskPageId(pageId: string): string {
  if (!pageId) return '（未设置）'
  if (pageId.length <= 12) return pageId.slice(0, 8) + '...'
  return pageId.slice(0, 8) + '...' + pageId.slice(-4)
}
