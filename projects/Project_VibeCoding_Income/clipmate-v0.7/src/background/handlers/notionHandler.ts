import { getSettings, addHistoryItem, updateHistoryItem } from '../../shared/storage/storage'
import { appendBlocks } from '../../platforms/notion/client'
import { formatCopyMarkdown } from '../../shared/utils/formatMarkdown'
import type { SaveToNotionPayload, SaveToNotionResponse } from '../../shared/types/message.types'
import { logger } from '../../shared/utils/logger'
import { createNotionSavePlan } from '../../features/notion'

export async function handleSaveToNotion(
  payload: SaveToNotionPayload,
): Promise<SaveToNotionResponse> {
  const { draft } = payload
  const settings = await getSettings()
  const planResult = createNotionSavePlan(settings, payload)

  if (!planResult.success) return planResult
  const { plan } = planResult

  try {
    await appendBlocks(plan.token, plan.pageId, plan.blocks)
    logger.info(`Saved ${plan.blocks.length} blocks to Notion`)

    if (plan.isRetryUpdate && plan.sourceHistoryId) {
      const now = new Date().toISOString()
      await updateHistoryItem(plan.sourceHistoryId, {
        saveStatus: 'saved',
        savedAt: now,
        targetId: plan.targetId,
        targetName: plan.targetName,
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
        draft.mode,
        draft.content.clipMode,
      )

      const now = new Date().toISOString()
      const meta = draft.content?.metadata
      await addHistoryItem({
        title: draft.title,
        url: draft.content.url,
        mode: draft.mode,
        tags: draft.tags,
        notePreview: draft.note.slice(0, 100),
        contentPreview: plan.contentText.slice(0, 100),
        markdown: fullMarkdown,
        wordCount: draft.content.wordCount,
        targetId: plan.targetId,
        targetName: plan.targetName,
        saveStatus: 'saved',
        savedAt: now,
        siteName: meta?.siteName,
        siteIconUrl: meta?.siteIconUrl,
        themeColor: meta?.themeColor,
        descriptionPreview: meta?.description,
        imageCount: draft.content.imageCount,
        firstImageUrl: draft.content.firstImageUrl,
        skippedImageCount: draft.content.skippedImageCount,
      })
    }

    return { success: true }
  } catch (err) {
    const code =
      err instanceof Error ? err.message : 'NOTION_SAVE_FAILED'
    logger.warn(`Notion save failed: ${code}`)

    if (plan.isRetryUpdate && plan.sourceHistoryId) {
      const now = new Date().toISOString()
      await updateHistoryItem(plan.sourceHistoryId, {
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
        draft.mode,
        draft.content.clipMode,
      )

      const meta = draft.content?.metadata
      await addHistoryItem({
        title: draft.title,
        url: draft.content.url,
        mode: draft.mode,
        tags: draft.tags,
        notePreview: draft.note.slice(0, 100),
        contentPreview: plan.contentText.slice(0, 100),
        markdown: fullMarkdown,
        wordCount: draft.content.wordCount,
        targetId: plan.targetId,
        targetName: plan.targetName,
        saveStatus: 'failed',
        errorCode: code,
        siteName: meta?.siteName,
        siteIconUrl: meta?.siteIconUrl,
        themeColor: meta?.themeColor,
        descriptionPreview: meta?.description,
        imageCount: draft.content.imageCount,
        firstImageUrl: draft.content.firstImageUrl,
        skippedImageCount: draft.content.skippedImageCount,
      })
    }

    return { success: false, error: code }
  }
}
