import type { NotionTarget } from '../../shared/types/settings.types'
import { generateId } from '../../shared/utils/id'

const HEX32_REGEX = /^[a-fA-F0-9]{32}$/
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/

export function extractNotionPageId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1]
      const hexMatch = lastSegment.match(/[a-fA-F0-9]{32}$/)
      if (hexMatch) return hexMatch[0]
    }
  } catch {
    // not a valid URL, continue
  }

  if (UUID_REGEX.test(trimmed)) {
    return trimmed.replace(/-/g, '')
  }

  if (HEX32_REGEX.test(trimmed)) {
    return trimmed
  }

  return null
}

export function addTarget(
  targets: NotionTarget[],
  name: string,
  pageId: string,
  makeDefault?: boolean,
): { targets: NotionTarget[]; newTarget: NotionTarget } {
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error('名称不能为空')
  }

  const normalizedPageId = extractNotionPageId(pageId)
  if (!normalizedPageId) {
    throw new Error('无法识别 Notion 页面 ID，请复制 Notion 页面链接或填写 32 位页面 ID')
  }

  const now = new Date().toISOString()
  const isFirst = targets.length === 0
  const shouldBeDefault = isFirst || makeDefault === true

  const newTarget: NotionTarget = {
    id: generateId(),
    name: trimmedName,
    pageId: normalizedPageId,
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

  if (!trimmedName) {
    throw new Error('名称不能为空')
  }

  const normalizedPageId = extractNotionPageId(pageId)
  if (!normalizedPageId) {
    throw new Error('无法识别 Notion 页面 ID，请复制 Notion 页面链接或填写 32 位页面 ID')
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
    pageId: normalizedPageId,
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
