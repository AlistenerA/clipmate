import { buildNotionBlocks } from '../../platforms/notion/blocks'
import type { ClipMateSettingsV2 } from '../../shared/types/settings.types'
import type { SaveToNotionPayload } from '../../shared/types/message.types'
import { getDraftBodyText } from '../capture'

interface BlockObjectRequest {
  object: 'block'
  type: string
  [key: string]: unknown
}

export interface NotionSavePlan {
  token: string
  pageId: string
  blocks: BlockObjectRequest[]
  contentText: string
  isRetryUpdate: boolean
  sourceHistoryId?: string
  targetId?: string
  targetName?: string
}

export type NotionSavePlanResult =
  | { success: true; plan: NotionSavePlan }
  | { success: false; error: string }

export function createNotionSavePlan(
  settings: Pick<ClipMateSettingsV2, 'notionToken'>,
  payload: SaveToNotionPayload,
): NotionSavePlanResult {
  if (!settings.notionToken) {
    return { success: false, error: 'NOTION_TOKEN_MISSING' }
  }

  if (!payload.pageId) {
    return { success: false, error: 'NOTION_PAGE_ID_MISSING' }
  }

  const contentText = getDraftBodyText(payload.draft)
  if (!contentText.trim()) {
    return { success: false, error: 'CONTENT_EMPTY' }
  }

  return {
    success: true,
    plan: {
      token: settings.notionToken,
      pageId: payload.pageId,
      blocks: buildNotionBlocks(payload.draft),
      contentText,
      isRetryUpdate:
        Boolean(payload.sourceHistoryId) && payload.historyWriteMode === 'update',
      sourceHistoryId: payload.sourceHistoryId,
      targetId: payload.targetId,
      targetName: payload.targetName,
    },
  }
}
