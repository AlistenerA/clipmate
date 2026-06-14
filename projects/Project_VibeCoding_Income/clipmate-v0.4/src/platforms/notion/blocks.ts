import type { ClipDraft } from '../../shared/types/clip.types'
import { parseNotionRichText } from './notionRichText'

interface BlockObjectRequest {
  object: 'block'
  type: string
  [key: string]: unknown
}

const MAX_TEXT_LENGTH = 2000

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= MAX_TEXT_LENGTH) {
      chunks.push(remaining)
      break
    }
    let splitAt = remaining.lastIndexOf('\n', MAX_TEXT_LENGTH)
    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf(' ', MAX_TEXT_LENGTH)
    }
    if (splitAt <= 0) {
      splitAt = MAX_TEXT_LENGTH
    }
    chunks.push(remaining.substring(0, splitAt))
    remaining = remaining.substring(splitAt).replace(/^\s+/, '')
  }
  return chunks
}

function richText(content: string) {
  return parseNotionRichText(content)
}

function paragraphBlock(text: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: richText(text) },
  }
}

function splitParagraphs(contentText: string): string[] {
  return contentText
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\n/g, ' '))
    .filter((p) => p.length > 0)
}

function chunkedParagraphBlocks(contentText: string): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = []
  const paragraphs = splitParagraphs(contentText)

  for (const para of paragraphs) {
    if (para.length <= MAX_TEXT_LENGTH) {
      blocks.push(paragraphBlock(para))
    } else {
      const chunks = chunkText(para)
      for (const chunk of chunks) {
        blocks.push(paragraphBlock(chunk))
      }
    }
  }

  return blocks
}

export function buildNotionBlocks(draft: ClipDraft): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = []

  if (draft.content?.clipMode === 'comment-context') {
    const contentText = draft.content?.markdown || draft.content?.contentText || ''
    if (contentText.trim()) {
      blocks.push(...chunkedParagraphBlocks(contentText.trim()))
    }
    return blocks
  }

  const title = (draft.title || draft.content?.title || '未命名剪藏').slice(0, MAX_TEXT_LENGTH)
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: richText(title) },
  })

  const url = draft.content?.url || ''
  if (url) {
    const displayUrl = `来源：${url}`.slice(0, MAX_TEXT_LENGTH)
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: displayUrl, link: { url } },
          },
        ],
      },
    })
  }

  if (draft.tags.length > 0) {
    const tagText = draft.tags.map((t) => `#${t}`).join(' ').slice(0, MAX_TEXT_LENGTH - 3)
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `标签：${tagText}` },
            annotations: { color: 'blue' },
          },
        ],
      },
    })
  }

  const noteText = draft.note.trim()
  if (noteText) {
    if (noteText.length <= MAX_TEXT_LENGTH) {
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: richText(noteText),
          icon: { emoji: '📝' },
        },
      })
    } else {
      const noteChunks = chunkText(noteText)
      for (const chunk of noteChunks) {
        blocks.push({
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: richText(chunk),
            icon: { emoji: '📝' },
          },
        })
      }
    }
  }

  blocks.push({
    object: 'block',
    type: 'divider',
    divider: {},
  })

  if (draft.mode === 'selection') {
    blocks.push({
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: richText('注：以下内容为网页选区摘录，并非全文。'),
        icon: { emoji: '📋' },
      },
    })
  }

  const contentText = draft.content?.markdown || draft.content?.contentText || ''
  if (contentText.trim()) {
    blocks.push(...chunkedParagraphBlocks(contentText.trim()))
  }

  return blocks
}
