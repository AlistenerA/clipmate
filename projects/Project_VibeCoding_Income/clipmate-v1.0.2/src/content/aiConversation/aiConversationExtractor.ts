import { htmlToMarkdown } from '../parser/htmlToMarkdown'
import type { SiteProfileMatch } from '../../shared/siteProfiles'

export type AiConversationRole = 'user' | 'assistant'

export interface AiConversationTurn {
  role: AiConversationRole
  markdown: string
  text: string
  html: string
}

export interface AiConversationExtraction {
  turns: AiConversationTurn[]
  markdown: string
  textContent: string
  contentHtml: string
}

const BASE_REMOVE_SELECTOR = [
  'script', 'style', 'noscript', 'button', 'form', 'input', 'textarea', 'svg',
  '[class*="message-action"]', '[class*="action-bar"]',
  '[class*="suggest-message"]', '[class*="suggestion"]',
].join(', ')

function hostnameOf(doc: Document): string {
  try {
    return new URL(doc.URL).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function topLevelMatches(doc: Document, selector: string): Element[] {
  try {
    return Array.from(doc.querySelectorAll(selector)).filter(
      (element) => !element.parentElement?.closest(selector),
    )
  } catch {
    return []
  }
}

function doubaoMessages(doc: Document): Element[] {
  const candidates = Array.from(doc.querySelectorAll('[class]')).filter((element) =>
    (element.getAttribute('class') || '').includes('max-w-(--content-max-width)') &&
    (element.textContent || '').trim().length > 0
  )
  return candidates.filter((element) => !candidates.some(
    (candidate) => candidate !== element && candidate.contains(element)
  ))
}

function messageElements(doc: Document, profile?: SiteProfileMatch | null): Element[] {
  const hostname = hostnameOf(doc)
  if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') {
    return topLevelMatches(doc, '[data-message-author-role]')
  }
  if (hostname === 'chat.deepseek.com' || hostname.endsWith('.deepseek.com')) {
    return topLevelMatches(doc, '.ds-message')
  }
  if (hostname === 'doubao.com' || hostname.endsWith('.doubao.com')) {
    return doubaoMessages(doc)
  }

  const selector = profile?.profile.selectorHints?.conversationMessage
  return selector ? topLevelMatches(doc, selector) : []
}

function roleForMessage(element: Element, doc: Document): AiConversationRole | null {
  const explicitRole = element.getAttribute('data-message-author-role') ||
    element.closest('[data-message-author-role]')?.getAttribute('data-message-author-role')
  if (explicitRole === 'user' || explicitRole === 'assistant') return explicitRole

  const hostname = hostnameOf(doc)
  if (hostname === 'chat.deepseek.com' || hostname.endsWith('.deepseek.com')) {
    return element.querySelector('.ds-assistant-message-main-content') ? 'assistant' : 'user'
  }
  if (hostname === 'doubao.com' || hostname.endsWith('.doubao.com')) {
    return element.querySelector('[class*="send-msg-bubble"]') ? 'user' : 'assistant'
  }

  const identity = `${element.id} ${element.getAttribute('class') || ''}`.toLowerCase()
  if (/\b(?:assistant|response|answer)\b/.test(identity)) return 'assistant'
  if (/\b(?:user|question|prompt)\b/.test(identity)) return 'user'
  return null
}

function contentElement(message: Element, role: AiConversationRole): Element {
  if (role === 'assistant') {
    return message.querySelector('.ds-assistant-message-main-content') || message
  }
  return message
}

function cleanMessage(element: Element, transientSelector?: string): Element {
  const clone = element.cloneNode(true) as Element
  clone.querySelectorAll(BASE_REMOVE_SELECTOR).forEach((node) => node.remove())
  if (transientSelector) {
    try {
      clone.querySelectorAll(transientSelector).forEach((node) => node.remove())
    } catch {
      // Invalid site hints must not block the generic extraction fallback.
    }
  }
  return clone
}

export function resolveAiConversationRole(
  element: Element | null,
  doc: Document,
): AiConversationRole | null {
  if (!element) return null
  const candidates = messageElements(doc)
  const message = candidates.find((candidate) => candidate.contains(element) || element.contains(candidate))
  return message ? roleForMessage(message, doc) : roleForMessage(element, doc)
}

export function extractAiConversation(
  doc: Document,
  siteProfileMatch?: SiteProfileMatch | null,
): AiConversationExtraction | null {
  const transientSelector = siteProfileMatch?.profile.selectorHints?.transientMessage
  const turns: AiConversationTurn[] = []

  for (const message of messageElements(doc, siteProfileMatch)) {
    const role = roleForMessage(message, doc)
    if (!role) continue
    const cleaned = cleanMessage(contentElement(message, role), transientSelector)
    const text = (cleaned.textContent || '').trim()
    if (!text) continue
    const markdown = htmlToMarkdown(cleaned.innerHTML, doc.URL).trim()
    if (!markdown) continue
    turns.push({ role, markdown, text, html: cleaned.innerHTML })
  }

  if (turns.length === 0) return null

  const markdown = turns.map((turn) =>
    `## ${turn.role === 'user' ? '用户' : '助手'}\n\n${turn.markdown}`
  ).join('\n\n')
  const textContent = turns.map((turn) =>
    `${turn.role === 'user' ? '用户' : '助手'}\n${turn.text}`
  ).join('\n\n')
  const contentHtml = turns.map((turn) =>
    `<section data-clipmate-conversation-role="${turn.role}"><h2>${turn.role === 'user' ? '用户' : '助手'}</h2>${turn.html}</section>`
  ).join('')

  return { turns, markdown, textContent, contentHtml }
}
