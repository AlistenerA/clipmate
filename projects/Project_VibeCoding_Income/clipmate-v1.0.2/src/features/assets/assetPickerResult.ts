import type { ExtractedContent } from '../../shared/types/clip.types'
import type { AssetPickerSessionState } from '../../shared/types/message.types'

export type AssetPickerResultAction = 'wait' | 'apply' | 'discard'

export function resolveAssetPickerResultAction(
  state: AssetPickerSessionState,
  content: ExtractedContent | null,
  activeTabUrl?: string
): AssetPickerResultAction {
  if (state.status === 'active') return 'wait'
  if (state.status === 'cancelled') return 'discard'
  if (!content || !activeTabUrl) return 'wait'

  return state.pageUrl === activeTabUrl && content.url === activeTabUrl ? 'apply' : 'discard'
}
