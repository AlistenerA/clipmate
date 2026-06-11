import { getSelectionHtml } from '../selection/getSelectionHtml'
import { getSelectionText } from '../selection/getSelectionText'

export interface SelectionResult {
  html: string
  text: string
}

export function extractSelection(): SelectionResult | null {
  const text = getSelectionText()
  if (!text) return null

  const html = getSelectionHtml() || ''

  return { html, text }
}
