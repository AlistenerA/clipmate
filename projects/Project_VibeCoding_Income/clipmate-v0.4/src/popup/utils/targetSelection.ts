import type { NotionTarget } from '../../shared/types/settings.types'

export function resolveSelectedTarget(
  targets: NotionTarget[],
  defaultTargetId?: string,
): NotionTarget | undefined {
  if (targets.length === 0) return undefined

  if (defaultTargetId) {
    const found = targets.find((t) => t.id === defaultTargetId)
    if (found) return found
  }

  return targets[0]
}

export function maskPageId(pageId: string): string {
  if (!pageId) return ''
  if (pageId.length <= 6) return pageId
  return '...' + pageId.slice(-6)
}
