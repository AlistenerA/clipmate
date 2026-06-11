import { MESSAGE_TYPES } from '../shared/constants/messageTypes'
import { logger } from '../shared/utils/logger'
import { extractFullpage } from './extractors/readabilityExtractor'
import { extractSelection } from './extractors/selectionExtractor'
import { fallbackExtract } from './extractors/fallbackExtractor'
import { parseMetadata } from './parser/metaParser'
import { cleanDocument } from './parser/contentCleaner'
import { htmlToMarkdown } from './parser/htmlToMarkdown'
import { countWords } from '../shared/utils/formatMarkdown'
import type { ExtractedContent } from '../shared/types/clip.types'
import type { ClipMateMessage } from '../shared/types/message.types'

interface ResultOk {
  success: true
  data: ExtractedContent
}

interface ResultErr {
  success: false
  error: string
}

type HandlerResult = ResultOk | ResultErr

function buildContent(
  mode: 'fullpage' | 'selection',
  extracted: { content: string; textContent: string },
  metaDoc: Document,
): ExtractedContent {
  const meta = parseMetadata(metaDoc)
  const markdown = htmlToMarkdown(extracted.content)
  const wordCount = countWords(extracted.textContent)

  return {
    mode,
    title: meta.title,
    url: meta.url,
    description: meta.description,
    contentText: extracted.textContent,
    contentHtml: extracted.content,
    markdown,
    wordCount,
    metadata: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      siteName: meta.siteName,
      createdAt: new Date().toISOString(),
      siteIconUrl: meta.siteIconUrl,
      themeColor: meta.themeColor,
    },
  }
}

function handleExtractFullpage(): HandlerResult {
  try {
    const docClone = document.cloneNode(true) as Document
    cleanDocument(docClone)

    let extracted = extractFullpage(docClone)

    if (!extracted) {
      logger.info('Readability failed, falling back to body.innerText')
      extracted = fallbackExtract(docClone)
    }

    const content = buildContent('fullpage', extracted, docClone)
    logger.info(`Fullpage: ${content.wordCount} words`)

    return { success: true, data: content }
  } catch (err) {
    logger.error('Fullpage extraction failed')
    return { success: false, error: 'EXTRACTION_FAILED' }
  }
}

function handleGetSelection(): HandlerResult {
  try {
    const result = extractSelection()
    if (!result) {
      return { success: false, error: 'NO_SELECTION' }
    }

    const content = buildContent('selection', {
      content: result.html,
      textContent: result.text,
    }, document)
    logger.info(`Selection: ${content.wordCount} words`)

    return { success: true, data: content }
  } catch (err) {
    logger.error('Selection extraction failed')
    return { success: false, error: 'EXTRACTION_FAILED' }
  }
}

chrome.runtime.onMessage.addListener(
  (message: ClipMateMessage, _sender, sendResponse) => {
    if (message.type === MESSAGE_TYPES.EXTRACT_CURRENT_PAGE) {
      sendResponse(handleExtractFullpage())
      return false
    }

    if (message.type === MESSAGE_TYPES.GET_SELECTION) {
      sendResponse(handleGetSelection())
      return false
    }

    return false
  },
)

logger.info('content script ready')
