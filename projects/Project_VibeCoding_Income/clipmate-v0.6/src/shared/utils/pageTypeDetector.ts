export type PageType =
  | 'article'
  | 'search-results'
  | 'navigation'
  | 'forum-or-comment'
  | 'video'
  | 'ai-answer'
  | 'unknown'

export interface PageTypeDetectionSignals {
  url: string
  title: string
  domain: string
  linkCount: number
  linkDensity: number
  textLength: number
  headingCount: number
  paragraphCount: number
  listCount: number
  formCount: number
  videoCount: number
  iframeCount: number
  articleLikeScore: number
  commentLikeCount: number
  hasSearchInput: boolean
  hasSearchRole: boolean
  hasConversationPattern: boolean
  hasCodeBlock: boolean
  mainTextLength: number
}

export interface PageTypeDetectionResult {
  type: PageType
  confidence: number
  reasons: string[]
  signals: PageTypeDetectionSignals
}

const MIN_ARTICLE_TEXT = 200
const MIN_ARTICLE_PARAGRAPHS = 2
const LOW_LINK_DENSITY = 0.3
const MEDIUM_LINK_DENSITY = 0.5

const SEARCH_URL_PATTERNS = [
  /\bsearch\b/i, /\bquery\b/i, /\bkeyword\b/i,
  /\bq=/i, /\bs=/i, /\bp=/i, /\bwd=/i,
  /\b结果\b/, /\b搜索\b/,
]

const VIDEO_URL_PATTERNS = [
  /\bwatch\b/i, /\bvideo\b/i, /\bplay\b/i,
  /\bepisode\b/i, /\bclip\b/i, /\blive\b/i,
]

const SEARCH_TITLE_KEYWORDS = [
  'search', '搜索', 'result', '结果', '查询', '检索',
]

const VIDEO_TITLE_KEYWORDS = [
  'video', 'watch', 'play', '视频', '播放', '直播',
]

const AI_TITLE_KEYWORDS = [
  'chat', 'assistant', 'ai', 'copilot', 'chatgpt',
  'claude', 'gemini', 'bard', '对话', '问答', '助手',
]

type AssessorResult = { confidence: number; reasons: string[] }

function assessArticle(input: PageTypeDetectionSignals): AssessorResult {
  const reasons: string[] = []
  let score = 0
  let weightSum = 0

  if (input.textLength >= MIN_ARTICLE_TEXT) { score += 1; weightSum++ }
  else { score += input.textLength / MIN_ARTICLE_TEXT; weightSum++ }
  reasons.push(`Text length: ${input.textLength} chars`)

  if (input.paragraphCount >= MIN_ARTICLE_PARAGRAPHS) { score += 1; weightSum++ }
  else { score += input.paragraphCount / MIN_ARTICLE_PARAGRAPHS; weightSum++ }
  reasons.push(`Paragraphs: ${input.paragraphCount}`)

  if (input.linkDensity <= LOW_LINK_DENSITY) { score += 1; weightSum++ }
  else if (input.linkDensity <= MEDIUM_LINK_DENSITY) { score += 0.5; weightSum++ }
  else { weightSum++ }
  reasons.push(`Link density: ${input.linkDensity.toFixed(2)}`)

  if (input.articleLikeScore >= 2) { score += 1; weightSum++ }
  else if (input.articleLikeScore >= 1) { score += 0.5; weightSum++ }
  else { weightSum++ }
  reasons.push(`Article-like signals: ${input.articleLikeScore}`)

  if (input.headingCount >= 2) { score += 1; weightSum++ }
  else if (input.headingCount >= 1) { score += 0.5; weightSum++ }
  else { weightSum++ }
  reasons.push(`Headings: ${input.headingCount}`)

  if (input.listCount > 0) { score += 0.3; weightSum += 0.3 }
  if (input.mainTextLength > input.textLength * 0.5) { score += 0.5; weightSum += 0.5 }

  if (input.textLength < 50) {
    score *= 0.3
    reasons.push('Very short text reduces article confidence')
  }

  if (input.videoCount > 0 || input.iframeCount > 0) {
    score *= 0.5
    reasons.push('Video/iframe elements reduce article confidence')
  }

  const confidence = Math.min(Math.round((score / Math.max(weightSum, 1)) * 100) / 100, 1)
  return { confidence, reasons }
}

function assessSearchResults(input: PageTypeDetectionSignals): AssessorResult {
  const reasons: string[] = []
  let score = 0
  let weightSum = 0

  let urlSignal = 0
  for (const pattern of SEARCH_URL_PATTERNS) {
    if (pattern.test(input.url)) { urlSignal = 1; break }
  }
  if (urlSignal) { score += 1 }
  weightSum++
  reasons.push(`URL search pattern: ${urlSignal ? 'yes' : 'no'}`)

  let titleSignal = 0
  const lowerTitle = input.title.toLowerCase()
  for (const kw of SEARCH_TITLE_KEYWORDS) {
    if (lowerTitle.includes(kw)) { titleSignal = 1; break }
  }
  if (titleSignal) { score += 1 }
  weightSum++
  reasons.push(`Title search keyword: ${titleSignal ? 'yes' : 'no'}`)

  if (input.hasSearchInput) { score += 2 }
  weightSum++
  reasons.push(`Search input: ${input.hasSearchInput}`)

  if (input.hasSearchRole) { score += 1 }
  weightSum += 0.5
  reasons.push(`Search role: ${input.hasSearchRole}`)

  if (input.linkCount > 5 && input.paragraphCount < 4) { score += 1 }
  else if (input.linkCount > 3 && input.paragraphCount < 3) { score += 0.5 }
  weightSum++
  reasons.push(`Result-like structure: links=${input.linkCount} paragraphs=${input.paragraphCount}`)

  if (input.linkDensity > MEDIUM_LINK_DENSITY && input.textLength < 1500) { score += 0.5 }
  weightSum += 0.5
  if (input.articleLikeScore < 1) { score += 0.5 }
  weightSum += 0.5

  const confidence = Math.round((score / Math.max(weightSum, 1)) * 100) / 100
  return { confidence, reasons }
}

function assessNavigation(input: PageTypeDetectionSignals): AssessorResult {
  const reasons: string[] = []
  let score = 0
  let weightSum = 0

  if (input.linkCount < 3) {
    reasons.push(`Too few links for navigation: ${input.linkCount}`)
    return { confidence: 0, reasons }
  }

  if (input.linkCount > 20) { score += 1 }
  else if (input.linkCount > 10) { score += 0.7 }
  else if (input.linkCount > 5) { score += 0.3 }
  weightSum++
  reasons.push(`Link count: ${input.linkCount}`)

  if (input.paragraphCount < 3) { score += 1 }
  else if (input.paragraphCount < 5) { score += 0.5 }
  weightSum++
  reasons.push(`Paragraphs: ${input.paragraphCount}`)

  if (input.linkDensity > MEDIUM_LINK_DENSITY) { score += 1 }
  else if (input.linkDensity > LOW_LINK_DENSITY) { score += 0.5 }
  weightSum++
  reasons.push(`Link density: ${input.linkDensity.toFixed(2)}`)

  if (input.textLength < 800 && input.paragraphCount < 3) { score += 1 }
  else if (input.textLength < 1500 && input.paragraphCount < 5) { score += 0.5 }
  weightSum++
  reasons.push(`Text length: ${input.textLength} chars`)

  if (input.articleLikeScore === 0) { score += 0.5 }
  weightSum += 0.5
  if (input.headingCount < 2) { score += 0.3 }
  weightSum += 0.3

  const lowerTitle = input.title.toLowerCase()
  const hasSearchTitleSignal = SEARCH_TITLE_KEYWORDS.some((kw) => lowerTitle.includes(kw))
  if (input.hasSearchInput || hasSearchTitleSignal) {
    score *= 0.3
    reasons.push('Search signals detected, reducing navigation confidence')
  }

  const confidence = Math.min(Math.round((score / Math.max(weightSum, 1)) * 100) / 100, 1)
  return { confidence, reasons }
}

function assessForumOrComment(input: PageTypeDetectionSignals): AssessorResult {
  const reasons: string[] = []
  let score = 0
  let weightSum = 0

  if (input.commentLikeCount > 8) { score += 1; weightSum++ }
  else if (input.commentLikeCount > 4) { score += 0.6; weightSum++ }
  else if (input.commentLikeCount > 1) { score += 0.3; weightSum++ }
  else { weightSum++ }
  reasons.push(`Comment-like signals: ${input.commentLikeCount}`)

  if (input.paragraphCount > 8 && input.textLength < 3000 && input.articleLikeScore < 2) {
    score += 0.7; weightSum += 0.7
    reasons.push('Many short blocks with low article score')
  }

  const avgParagraphLen = input.paragraphCount > 0
    ? input.textLength / input.paragraphCount : 0
  if (avgParagraphLen < 100 && input.paragraphCount >= 5) {
    score += 0.5; weightSum += 0.5
    reasons.push(`Short average paragraph: ${Math.round(avgParagraphLen)} chars`)
  }

  if (input.articleLikeScore < 1) { score += 0.5; weightSum += 0.5 }

  const confidence = Math.round((score / Math.max(weightSum, 1)) * 100) / 100
  return { confidence, reasons }
}

function assessVideo(input: PageTypeDetectionSignals): AssessorResult {
  const reasons: string[] = []
  let score = 0
  let weightSum = 0

  if (input.videoCount > 0) { score += 1 }
  weightSum++
  reasons.push(`Video elements: ${input.videoCount}`)

  if (input.iframeCount > 0) { score += 0.3 }
  weightSum += 0.3
  reasons.push(`Iframe elements: ${input.iframeCount}`)

  let urlSignal = 0
  for (const pattern of VIDEO_URL_PATTERNS) {
    if (pattern.test(input.url)) { urlSignal = 1; break }
  }
  if (urlSignal) { score += 0.8 }
  weightSum += 0.8
  reasons.push(`URL video pattern: ${urlSignal ? 'yes' : 'no'}`)

  let titleSignal = 0
  const lowerTitle = input.title.toLowerCase()
  for (const kw of VIDEO_TITLE_KEYWORDS) {
    if (lowerTitle.includes(kw)) { titleSignal = 1; break }
  }
  if (titleSignal) { score += 0.5 }
  weightSum += 0.5
  reasons.push(`Title video keyword: ${titleSignal ? 'yes' : 'no'}`)

  if (input.textLength < 400 && input.videoCount > 0) { score += 0.5 }
  weightSum += 0.5

  const confidence = Math.round((score / Math.max(weightSum, 1)) * 100) / 100
  return { confidence, reasons }
}

function assessAiAnswer(input: PageTypeDetectionSignals): AssessorResult {
  const reasons: string[] = []
  let score = 0
  let weightSum = 0

  if (input.hasConversationPattern) { score += 1 }
  weightSum++
  reasons.push(`Conversation pattern: ${input.hasConversationPattern}`)

  if (input.hasCodeBlock) { score += 0.3 }
  weightSum += 0.3
  reasons.push(`Code blocks: ${input.hasCodeBlock}`)

  let titleSignal = 0
  const lowerTitle = input.title.toLowerCase()
  for (const kw of AI_TITLE_KEYWORDS) {
    if (lowerTitle.includes(kw)) { titleSignal = 1; break }
  }
  if (titleSignal) { score += 0.7 }
  weightSum += 0.7
  reasons.push(`AI title keyword: ${titleSignal ? 'yes' : 'no'}`)

  if (input.articleLikeScore < 2) { score += 0.3 }
  weightSum += 0.3

  const confidence = Math.round((score / Math.max(weightSum, 1)) * 100) / 100
  return { confidence, reasons }
}

const MIN_CONFIDENCE_THRESHOLD = 0.45

export function detectPageType(input: PageTypeDetectionSignals): PageTypeDetectionResult {
  const assessments: { type: PageType; confidence: number; reasons: string[] }[] = [
    { type: 'article', ...assessArticle(input) },
    { type: 'search-results', ...assessSearchResults(input) },
    { type: 'navigation', ...assessNavigation(input) },
    { type: 'forum-or-comment', ...assessForumOrComment(input) },
    { type: 'video', ...assessVideo(input) },
    { type: 'ai-answer', ...assessAiAnswer(input) },
  ]

  let best = assessments[0]
  for (let i = 1; i < assessments.length; i++) {
    if (assessments[i].confidence > best.confidence) {
      best = assessments[i]
    }
  }

  if (best.confidence < MIN_CONFIDENCE_THRESHOLD) {
    return {
      type: 'unknown',
      confidence: Math.round((1 - best.confidence) * 100) / 100,
      reasons: [`No strong signal detected. Best match: ${best.type} (${best.confidence.toFixed(2)})`],
      signals: input,
    }
  }

  const conflicts = assessments.filter(
    (a) => a.type !== best.type && a.confidence > best.confidence * 0.7,
  )
  if (conflicts.length >= 2) {
    const conflictTypes = conflicts.map((c) => `${c.type}(${c.confidence.toFixed(2)})`).join(', ')
    best.reasons.push(`Signal conflict with: ${conflictTypes}`)
  }

  return {
    type: best.type,
    confidence: best.confidence,
    reasons: best.reasons,
    signals: input,
  }
}

export function extractSignalsFromDocument(doc: Document): PageTypeDetectionSignals {
  const url = doc.URL || ''
  const title = doc.title || ''
  let domain = ''
  try {
    domain = new URL(url).hostname
  } catch {
    domain = ''
  }

  const bodyText = (doc.body.textContent || '').trim()
  const textLength = bodyText.length
  const paragraphs = bodyText.split(/\n\s*\n/).filter((p) => p.trim().length > 20)
  const paragraphCount = paragraphs.length

  const links = doc.querySelectorAll('a[href]')
  const linkCount = links.length

  let linkTextLen = 0
  links.forEach((a) => {
    linkTextLen += (a.textContent || '').trim().length
  })
  const linkDensity = textLength > 0 ? Math.min(linkTextLen / textLength, 1.0) : 0

  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const headingCount = headings.length

  const lists = doc.querySelectorAll('ul, ol')
  const listCount = lists.length

  const forms = doc.querySelectorAll('form')
  const formCount = forms.length

  const videos = doc.querySelectorAll('video')
  const videoCount = videos.length

  const iframes = doc.querySelectorAll('iframe')
  const iframeCount = iframes.length

  let articleLikeScore = 0
  const articles = doc.querySelectorAll('article')
  const mains = doc.querySelectorAll('main')
  articleLikeScore += articles.length * 2
  articleLikeScore += mains.length * 2
  if (doc.querySelector('[class*="article"], [class*="post"], [class*="entry"], [class*="story"], [class*="detail"], [class*="content"]')) articleLikeScore++
  if (doc.querySelector('meta[property="og:type"][content="article"]')) articleLikeScore++
  if (doc.querySelector('meta[name="description"]')?.getAttribute('content')?.length ?? 0 > 50) articleLikeScore++
  if (textLength > 1000 && paragraphCount >= 3 && linkDensity < LOW_LINK_DENSITY) articleLikeScore += 2

  let commentLikeCount = 0
  const commentSelectors = [
    '[class*="comment"]', '[class*="reply"]', '[class*="thread"]',
    '[class*="discussion"]', '[class*="conversation"]',
    '[id*="comment"]', '[id*="reply"]', '[id*="thread"]',
    '[class*="评论"]', '[class*="回复"]', '[class*="跟帖"]',
    '[class*="留言"]', '[class*="楼层"]',
  ]
  for (const sel of commentSelectors) {
    try {
      commentLikeCount += doc.querySelectorAll(sel).length
    } catch { /* ignore invalid selectors */ }
  }

  const hasSearchInput = doc.querySelector(
    'input[type="search"], input[name="q"], input[name="query"], input[name="search"], input[name="wd"]',
  ) !== null
  const hasSearchRole = doc.querySelector('[role="search"]') !== null

  let hasConversationPattern = false
  const convSelectors = [
    '[class*="assistant"]', '[class*="user"]', '[class*="message"]',
    '[class*="conversation"]', '[class*="chat"]',
    '[class*="response"]', '[class*="turn"]',
    '[data-message-author-role]', '[data-role]',
  ]
  for (const sel of convSelectors) {
    try {
      if (doc.querySelectorAll(sel).length > 2) {
        hasConversationPattern = true
        break
      }
    } catch { /* ignore invalid selectors */ }
  }

  const hasCodeBlock = doc.querySelectorAll('pre code, code[class*="language-"]').length > 0

  const mainEl = doc.querySelector('main, article, [role="main"]')
  const mainTextLength = mainEl ? (mainEl.textContent || '').trim().length : textLength

  return {
    url,
    title,
    domain,
    linkCount,
    linkDensity,
    textLength,
    headingCount,
    paragraphCount,
    listCount,
    formCount,
    videoCount,
    iframeCount,
    articleLikeScore,
    commentLikeCount,
    hasSearchInput,
    hasSearchRole,
    hasConversationPattern,
    hasCodeBlock,
    mainTextLength,
  }
}

export function detectPageTypeFromDocument(doc: Document): PageTypeDetectionResult {
  return detectPageType(extractSignalsFromDocument(doc))
}
