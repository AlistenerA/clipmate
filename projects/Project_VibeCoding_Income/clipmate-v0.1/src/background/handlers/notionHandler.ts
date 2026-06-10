import { getSettings } from '../../shared/storage/storage'
import { appendBlocks } from '../../platforms/notion/client'
import { buildNotionBlocks } from '../../platforms/notion/blocks'
import type { ClipDraft } from '../../shared/types/clip.types'
import type { SaveToNotionResponse } from '../../shared/types/message.types'
import { logger } from '../../shared/utils/logger'

export async function handleSaveToNotion(
  draft: ClipDraft,
): Promise<SaveToNotionResponse> {
  const settings = await getSettings()

  if (!settings.notionToken) {
    return { success: false, error: 'NOTION_TOKEN_MISSING' }
  }
  if (!settings.notionPageId) {
    return { success: false, error: 'NOTION_PAGE_ID_MISSING' }
  }

  const contentText =
    draft.content?.markdown || draft.content?.contentText || ''
  if (!contentText.trim()) {
    return { success: false, error: 'CONTENT_EMPTY' }
  }

  const blocks = buildNotionBlocks(draft)

  try {
    await appendBlocks(settings.notionToken, settings.notionPageId, blocks)
    logger.info(`Saved ${blocks.length} blocks to Notion`)
    return { success: true }
  } catch (err) {
    const code =
      err instanceof Error ? err.message : 'NOTION_SAVE_FAILED'
    logger.error('Notion save failed', err)
    return { success: false, error: code }
  }
}
