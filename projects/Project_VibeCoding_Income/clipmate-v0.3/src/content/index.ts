import { MESSAGE_TYPES } from '../shared/constants/messageTypes'
import { logger } from '../shared/utils/logger'
import { extractFullpage } from './extractors/readabilityExtractor'
import { extractSelection } from './extractors/selectionExtractor'
import { fallbackExtract } from './extractors/fallbackExtractor'
import { parseMetadata } from './parser/metaParser'
import { cleanDocument } from './parser/contentCleaner'
import { htmlToMarkdown } from './parser/htmlToMarkdown'
import { countWords } from '../shared/utils/formatMarkdown'
import {
  preCleanDocument,
  trimArticleBody,
  assessArticleConfidence,
  buildLowConfidenceSummary,
} from './extractors/articleBoundaryGuard'
import type { ExtractedContent } from '../shared/types/clip.types'
import type { ClipMateMessage } from '../shared/types/message.types'

function extractMathJaxFormulas(doc: Document): void {
  const scripts = doc.querySelectorAll('script[type^="math/tex"]')
  for (const script of scripts) {
    const type = script.getAttribute('type') || ''
    const content = script.textContent?.trim()
    if (!content) continue

    const isDisplay = /mode\s*=\s*display/i.test(type)
    const span = doc.createElement('span')
    span.setAttribute('data-clipmate-formula', isDisplay ? 'display' : 'inline')
    span.textContent = isDisplay ? `\n$$${content}$$\n` : `$${content}$`
    script.replaceWith(span)
  }
}

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
    extractMathJaxFormulas(docClone)
    cleanDocument(docClone)
    const noiseRemoved = preCleanDocument(docClone)
    logger.info(`Pre-clean removed ${noiseRemoved} noise nodes`)

    const extracted = extractFullpage(docClone)

    if (!extracted) {
      logger.info('Readability failed, falling back to improved fallback')
      const fallbackMeta = parseMetadata(docClone)
      const fallbackResult = fallbackExtract(docClone)
      const fallbackMd = htmlToMarkdown(fallbackResult.content)
      const trimmed = trimArticleBody(fallbackMd)
      const fallbackWordCount = countWords(fallbackResult.textContent)
      const report = assessArticleConfidence(fallbackResult.textContent, fallbackResult.content)

      if (report.confidence === 'low') {
        const summary = buildLowConfidenceSummary(
          docClone,
          fallbackMeta.title,
          fallbackMeta.url,
        )
        return {
          success: true,
          data: {
            mode: 'fullpage',
            title: fallbackMeta.title,
            url: fallbackMeta.url,
            description: fallbackMeta.description,
            contentText: summary,
            contentHtml: '',
            markdown: summary,
            wordCount: 0,
            metadata: {
              url: fallbackMeta.url,
              title: fallbackMeta.title,
              description: fallbackMeta.description,
              siteName: fallbackMeta.siteName,
              createdAt: new Date().toISOString(),
              siteIconUrl: fallbackMeta.siteIconUrl,
              themeColor: fallbackMeta.themeColor,
            },
          },
        }
      }

      const content = buildContent('fullpage', fallbackResult, docClone)
      content.markdown = trimmed
      logger.info(`Fullpage fallback: ${fallbackWordCount} words`)
      return { success: true, data: content }
    }

    const report = assessArticleConfidence(extracted.textContent, extracted.content)

    if (report.confidence === 'low') {
      const meta = parseMetadata(docClone)
      const summary = buildLowConfidenceSummary(docClone, meta.title, meta.url)
      return {
        success: true,
        data: {
          mode: 'fullpage',
          title: meta.title,
          url: meta.url,
          description: meta.description,
          contentText: summary,
          contentHtml: '',
          markdown: summary,
          wordCount: 0,
          metadata: {
            url: meta.url,
            title: meta.title,
            description: meta.description,
            siteName: meta.siteName,
            createdAt: new Date().toISOString(),
            siteIconUrl: meta.siteIconUrl,
            themeColor: meta.themeColor,
          },
        },
      }
    }

    const content = buildContent('fullpage', extracted, docClone)
    content.markdown = trimArticleBody(content.markdown)
    logger.info(`Fullpage: ${content.wordCount} words (${report.confidence} confidence)`)

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
