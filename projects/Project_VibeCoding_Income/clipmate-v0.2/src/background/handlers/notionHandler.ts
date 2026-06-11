import { getSettings, addHistoryItem, updateHistoryItem } from '../../shared/storage/storage'
import { appendBlocks } from '../../platforms/notion/client'
import { buildNotionBlocks } from '../../platforms/notion/blocks'
import { formatCopyMarkdown } from '../../shared/utils/formatMarkdown'
import type { SaveToNotionPayload, SaveToNotionResponse } from '../../shared/types/message.types'
import { logger } from '../../shared/utils/logger'

export async function handleSaveToNotion(
  payload: SaveToNotionPayload,
): Promise<SaveToNotionResponse> {
  const { draft, targetId, targetName, pageId, sourceHistoryId, historyWriteMode } = payload
  const settings = await getSettings()

  if (!settings.notionToken) {
    return { success: false, error: 'NOTION_TOKEN_MISSING' }
  }
  if (!pageId) {
    return { success: false, error: 'NOTION_PAGE_ID_MISSING' }
  }

  const contentText =
    draft.content?.markdown || draft.content?.contentText || ''
  if (!contentText.trim()) {
    return { success: false, error: 'CONTENT_EMPTY' }
  }

  const isRetryUpdate =
    sourceHistoryId && historyWriteMode === 'update'

  const blocks = buildNotionBlocks(draft)

  try {
    await appendBlocks(settings.notionToken, pageId, blocks)
    logger.info(`Saved ${blocks.length} blocks to Notion`)

    if (isRetryUpdate) {
      const now = new Date().toISOString()
      await updateHistoryItem(sourceHistoryId, {
        saveStatus: 'saved',
        savedAt: now,
        targetId,
        targetName,
        errorCode: undefined,
   	updatedAt: now,
      })
    } else if (settings.saveHistoryEnabled) {
      const fullMarkdown = formatCopyMarkdown(
        draft.title,
        draft.content.url,
        draft.tags,
        draft.note,
        draft.content.markdown,
      )

      const now = new Date().toISOString()
      const meta = draft.content?.metadata
      await addHistoryItem({
        title: draft.title,
        url: draft.content.url,
        mode: draft.mode,
        tags: draft.tags,
        notePreview: draft.note.slice(0, 100),
        contentPreview: contentText.slice(0, 100),
        markdown: fullMarkdown,
        wordCount: draft.content.wordCount,
        targetId,
        targetName,
        saveStatus: 'saved',
        savedAt: now,
        siteName: meta?.siteName,
        siteIconUrl: meta?.siteIconUrl,
        themeColor: meta?.themeColor,
        descriptionPreview: meta?.description,
      })
    }

    return { success: true }
  } catch (err) {
    const code =
      err instanceof Error ? err.message : 'NOTION_SAVE_FAILED'
    logger.error(`Notion save failed: ${code}`)

    if (isRetryUpdate) {
      const now = new Date().toISOString()
      await updateHistoryItem(sourceHistoryId, {
        saveStatus: 'failed',
        errorCode: code,
        updatedAt: now,
      })
    } else if (settings.saveHistoryEnabled) {
      const fullMarkdown = formatCopyMarkdown(
        draft.title,
        draft.content.url,
        draft.tags,
        draft.note,
        draft.content.markdown,
      )

      const meta = draft.content?.metadata
      await addHistoryItem({
        title: draft.title,
        url: draft.content.url,
        mode: draft.mode,
        tags: draft.tags,
        notePreview: draft.note.slice(0, 100),
        contentPreview: contentText.slice(0, 100),
        markdown: fullMarkdown,
        wordCount: draft.content.wordCount,
        targetId,
        targetName,
        saveStatus: 'failed',
        errorCode: code,
        siteName: meta?.siteName,
        siteIconUrl: meta?.siteIconUrl,
        themeColor: meta?.themeColor,
        descriptionPreview: meta?.description,
      })
    }

    return { success: false, error: code }
  }
}
