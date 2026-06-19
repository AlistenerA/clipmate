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
  classifyPageType,
  confidenceToNumeric
} from './extractors/articleBoundaryGuard'
import { matchSiteProfile } from '../shared/siteProfiles'
import { collectIntentSnapshot, getSelectionRootElement } from './intent'
import {
  buildCommentSelectionDraft,
  formatCommentContextMarkdown,
  resolveCommentContext,
  buildSemanticCommentContextTitle
} from './commentSelection'
import type { ExtractedContent } from '../shared/types/clip.types'
import type { ClipMateMessage } from '../shared/types/message.types'
import type {
  AssetPickerSessionPayload,
  StartAssetPickerPayload
} from '../shared/types/message.types'
import { extractArticleImages } from './extractors/articleImages'
import { assetPickerController } from './assetPicker'
import {
  appendVideoLinkMetadata,
  collectUnknownResourceDiagnostics,
  createClipDocument,
  extractVideoPageSummary,
  formatVideoPageMarkdown,
  type ClipVideoLinkInput
} from '../features/document'
import { getVideoProvider } from '../shared/media/videoUrl'

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

function createFragmentDocument(html: string): Document {
  const dom = new DOMParser().parseFromString(html, 'text/html')
  return dom
}

function injectMissingImages(markdown: string, contentHtml: string, pageUrl: string): string {
  try {
    if (!contentHtml || !contentHtml.trim()) return markdown

    const fragmentDoc = createFragmentDocument(contentHtml)
    const imageResult = extractArticleImages(fragmentDoc.body || fragmentDoc.documentElement, {
      pageUrl
    })
    if (imageResult.images.length === 0) return markdown

    const mdLower = markdown.toLowerCase()
    const missingImages = imageResult.images.filter(
      (img) => !mdLower.includes(img.url.toLowerCase())
    )
    if (missingImages.length === 0) return markdown

    const lines = ['\n---\n', '## Images\n']
    for (const img of missingImages) {
      const alt = img.alt || ''
      lines.push(`![${alt}](${img.url})`)
      if (img.caption && img.caption !== img.alt) {
        lines.push(`*${img.caption}*`)
      }
    }
    return markdown + '\n' + lines.join('\n')
  } catch {
    return markdown
  }
}

function buildContent(
  mode: 'fullpage' | 'selection',
  extracted: { content: string; textContent: string },
  metaDoc: Document
): ExtractedContent {
  const meta = parseMetadata(metaDoc)
  const markdown = htmlToMarkdown(extracted.content, meta.url)
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
      author: meta.author,
      publishedAt: meta.publishedAt,
      siteIconUrl: meta.siteIconUrl,
      themeColor: meta.themeColor
    },
    imageCount: mode === 'fullpage' ? undefined : 0,
    skippedImageCount: mode === 'fullpage' ? undefined : 0
  }
}

function attachImageMetadata(
  content: ExtractedContent,
  contentHtml: string,
  pageUrl: string
): void {
  try {
    const fragmentDoc = createFragmentDocument(contentHtml)
    const imageResult = extractArticleImages(fragmentDoc.body || fragmentDoc.documentElement, {
      pageUrl
    })
    content.imageCount = imageResult.images.length
    content.firstImageUrl = imageResult.images[0]?.url
    content.skippedImageCount = imageResult.skipped.length
  } catch {
    content.imageCount = 0
    content.skippedImageCount = 0
  }
}

function collectTutorialVideoLinks(doc: Document, pageUrl: string): ClipVideoLinkInput[] {
  const links: ClipVideoLinkInput[] = []
  const seen = new Set<string>()
  const videoHostPattern =
    /(?:youtube\.com|youtu\.be|vimeo\.com|bilibili\.com|youku\.com|qq\.com\/x\/cover)/i

  const add = (
    rawUrl: string | null,
    source: ClipVideoLinkInput['source'],
    title?: string | null
  ) => {
    if (!rawUrl) return
    try {
      const url = new URL(rawUrl, pageUrl)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return
      const normalized = url.toString()
      if (seen.has(normalized)) return
      seen.add(normalized)
      links.push({
        url: normalized,
        title: title?.trim() || undefined,
        provider: getVideoProvider(normalized),
        source
      })
    } catch {
      return
    }
  }

  doc.querySelectorAll('video').forEach((node) => {
    add(
      node.getAttribute('src'),
      'video',
      node.getAttribute('title') || node.getAttribute('aria-label')
    )
    node.querySelectorAll('source[src]').forEach((source) => {
      add(
        source.getAttribute('src'),
        'source',
        node.getAttribute('title') || node.getAttribute('aria-label')
      )
    })
  })

  doc.querySelectorAll('iframe[src]').forEach((node) => {
    const src = node.getAttribute('src')
    if (!src || !videoHostPattern.test(src)) return
    add(src, 'iframe', node.getAttribute('title') || node.getAttribute('aria-label'))
  })

  return links
}

function finalizeFullpageContent(
  content: ExtractedContent,
  mode: 'fullpage' | 'tutorial',
  sourceDocument: Document = document
): ExtractedContent {
  content.mode = mode
  if (mode !== 'tutorial') return content

  const pageUrl = content.url || sourceDocument.URL
  const videoPage = extractVideoPageSummary(sourceDocument, {
    title: content.title,
    url: pageUrl,
    description: content.description
  })
  const videoLinks: ClipVideoLinkInput[] = videoPage
    ? [
        {
          url: videoPage.url,
          title: videoPage.title,
          provider: videoPage.provider,
          source: 'markdown'
        }
      ]
    : collectTutorialVideoLinks(sourceDocument, pageUrl)

  if (videoPage) {
    content.title = videoPage.title
    content.url = videoPage.url
    content.description = videoPage.description
    content.metadata = {
      ...content.metadata,
      title: videoPage.title,
      url: videoPage.url,
      description: videoPage.description
    }
    content.markdown = formatVideoPageMarkdown(videoPage)
    content.contentText = [videoPage.description, videoPage.commentCount].filter(Boolean).join('\n')
    content.contentHtml = ''
    content.wordCount = countWords(content.contentText)
    content.imageCount = 0
    content.firstImageUrl = undefined
    content.skippedImageCount = 0
  } else {
    content.markdown = appendVideoLinkMetadata(content.markdown, videoLinks)
  }

  const unknownResources = collectUnknownResourceDiagnostics(sourceDocument, pageUrl)
  content.clipDocument = createClipDocument({
    title: content.title,
    url: content.url,
    markdown: content.markdown,
    videoLinks,
    unknownResources
  })
  return content
}

function handleExtractFullpage(mode: 'fullpage' | 'tutorial' = 'fullpage'): HandlerResult {
  try {
    const docClone = document.cloneNode(true) as Document
    extractMathJaxFormulas(docClone)
    cleanDocument(docClone)

    const pageType = classifyPageType(docClone)
    const siteProfileMatch = matchSiteProfile({
      url: document.URL,
      pageType
    })
    const excludeSelectors = siteProfileMatch?.profile.selectorHints?.excludeSelector

    const noiseRemoved = preCleanDocument(docClone, excludeSelectors)
    logger.info(`Pre-clean removed ${noiseRemoved} noise nodes`)

    const extracted = extractFullpage(docClone)

    if (!extracted) {
      logger.info('Readability failed, falling back to improved fallback')
      const fallbackMeta = parseMetadata(docClone)
      const fallbackResult = fallbackExtract(docClone)
      const fallbackMd = htmlToMarkdown(fallbackResult.content, document.URL)
      const trimmed = trimArticleBody(fallbackMd)
      const fallbackWordCount = countWords(fallbackResult.textContent)
      const report = assessArticleConfidence(fallbackResult.textContent, fallbackResult.content)

      if (report.confidence === 'low') {
        const pageType = classifyPageType(docClone)
        const summary = buildLowConfidenceSummary(
          docClone,
          fallbackMeta.title,
          fallbackMeta.url,
          pageType,
          confidenceToNumeric(report.confidence),
          report.linkDensity
        )
        return {
          success: true,
          data: finalizeFullpageContent(
            {
              mode,
              title: fallbackMeta.title,
              url: fallbackMeta.url,
              description: fallbackMeta.description,
              contentText: summary,
              contentHtml: '',
              markdown: summary,
              wordCount: 0,
              imageCount: 0,
              skippedImageCount: 0,
              metadata: {
                url: fallbackMeta.url,
                title: fallbackMeta.title,
                description: fallbackMeta.description,
                siteName: fallbackMeta.siteName,
                createdAt: new Date().toISOString(),
                author: fallbackMeta.author,
                publishedAt: fallbackMeta.publishedAt,
                siteIconUrl: fallbackMeta.siteIconUrl,
                themeColor: fallbackMeta.themeColor
              }
            },
            mode
          )
        }
      }

      const content = buildContent('fullpage', fallbackResult, docClone)
      content.markdown = trimmed
      content.markdown = injectMissingImages(content.markdown, fallbackResult.content, document.URL)
      attachImageMetadata(content, fallbackResult.content, document.URL)
      logger.info(`Fullpage fallback: ${fallbackWordCount} words`)
      return { success: true, data: finalizeFullpageContent(content, mode) }
    }

    const report = assessArticleConfidence(extracted.textContent, extracted.content)

    if (report.confidence === 'low') {
      const meta = parseMetadata(docClone)
      const pageType = classifyPageType(docClone)
      const summary = buildLowConfidenceSummary(
        docClone,
        meta.title,
        meta.url,
        pageType,
        confidenceToNumeric(report.confidence),
        report.linkDensity
      )
      return {
        success: true,
        data: finalizeFullpageContent(
          {
            mode,
            title: meta.title,
            url: meta.url,
            description: meta.description,
            contentText: summary,
            contentHtml: '',
            markdown: summary,
            wordCount: 0,
            imageCount: 0,
            skippedImageCount: 0,
            metadata: {
              url: meta.url,
              title: meta.title,
              description: meta.description,
              siteName: meta.siteName,
              createdAt: new Date().toISOString(),
              author: meta.author,
              publishedAt: meta.publishedAt,
              siteIconUrl: meta.siteIconUrl,
              themeColor: meta.themeColor
            }
          },
          mode
        )
      }
    }

    const content = buildContent('fullpage', extracted, docClone)
    content.markdown = trimArticleBody(content.markdown)
    content.markdown = injectMissingImages(content.markdown, extracted.content, document.URL)
    attachImageMetadata(content, extracted.content, document.URL)
    logger.info(`Fullpage: ${content.wordCount} words (${report.confidence} confidence)`)

    return { success: true, data: finalizeFullpageContent(content, mode) }
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

    const content = buildContent(
      'selection',
      {
        content: result.html,
        textContent: result.text
      },
      document
    )

    const sel = window.getSelection()
    const pageType = classifyPageType(document)
    const siteProfileMatch = matchSiteProfile({
      url: document.URL,
      pageType
    })

    const intentSnapshot = collectIntentSnapshot({
      document,
      pageType,
      siteProfileMatch,
      selection: sel
    })

    const draft = buildCommentSelectionDraft({
      title: content.title,
      url: content.url,
      pageType,
      siteProfileMatch,
      intentSnapshot,
      selectionText: result.text,
      selectionHtml: result.html,
      selectionMarkdown: content.markdown,
      selectionContext: intentSnapshot.selectionContext,
      selectionRoot: getSelectionRootElement(sel)
    })

    if (draft.mode !== 'selection-generic') {
      const hostname = (() => {
        try {
          return new URL(document.URL).hostname
        } catch {
          return ''
        }
      })()

      if (hostname.includes('bilibili.com')) {
        draft.mode = 'selection-generic'
      }
    }

    if (draft.mode !== 'selection-generic') {
      const context = resolveCommentContext({
        document,
        pageTitle: content.title,
        pageUrl: content.url,
        siteProfileMatch,
        selectionText: result.text,
        selectionRoot: getSelectionRootElement(sel),
        mode: draft.mode,
        reasons: draft.reasons
      })
      content.markdown = formatCommentContextMarkdown(context)
      content.contentText = content.markdown
      content.contentHtml = ''
      const canonicalTitle = buildSemanticCommentContextTitle(context)
      content.title = canonicalTitle
      content.metadata.title = canonicalTitle
      content.description = context.sourceExcerpt || ''
      content.clipMode = 'comment-context'
    }

    logger.info(`Selection: ${content.wordCount} words (${draft.mode})`)

    return { success: true, data: content }
  } catch (err) {
    logger.error('Selection extraction failed')
    return { success: false, error: 'EXTRACTION_FAILED' }
  }
}

chrome.runtime.onMessage.addListener((message: ClipMateMessage, _sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.START_ASSET_PICKER) {
    const state = assetPickerController.start(message.payload as StartAssetPickerPayload)
    sendResponse(
      state ? { success: true, data: state } : { success: false, error: 'NO_PICKABLE_IMAGES' }
    )
    return false
  }

  if (message.type === MESSAGE_TYPES.GET_ASSET_PICKER_STATE) {
    sendResponse({ success: true, data: assetPickerController.getState() })
    return false
  }

  if (message.type === MESSAGE_TYPES.CANCEL_ASSET_PICKER) {
    const payload = message.payload as AssetPickerSessionPayload | undefined
    const cancelled = assetPickerController.cancel(payload?.sessionId)
    sendResponse(
      cancelled
        ? { success: true, data: assetPickerController.getState() }
        : { success: false, error: 'ASSET_PICKER_SESSION_NOT_FOUND' }
    )
    return false
  }

  if (message.type === MESSAGE_TYPES.CONSUME_ASSET_PICKER_RESULT) {
    const payload = message.payload as AssetPickerSessionPayload
    const consumed = assetPickerController.consume(payload.sessionId)
    sendResponse(
      consumed
        ? { success: true, data: null }
        : { success: false, error: 'ASSET_PICKER_SESSION_MISMATCH' }
    )
    return false
  }

  if (message.type === MESSAGE_TYPES.EXTRACT_CURRENT_PAGE) {
    sendResponse(handleExtractFullpage())
    return false
  }

  if (message.type === MESSAGE_TYPES.EXTRACT_TUTORIAL) {
    sendResponse(handleExtractFullpage('tutorial'))
    return false
  }

  if (message.type === MESSAGE_TYPES.GET_SELECTION) {
    sendResponse(handleGetSelection())
    return false
  }

  return false
})

logger.info('content script ready')
