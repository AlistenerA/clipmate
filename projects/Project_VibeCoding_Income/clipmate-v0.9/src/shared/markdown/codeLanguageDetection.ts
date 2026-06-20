import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import type { ExtractedContent } from '../types/clip.types'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('python', python)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)

const FAST_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'sql',
  'xml',
  'css',
  'bash',
  'json',
]
const FAST_CONFIDENCE_THRESHOLD = 8
const ML_CONFIDENCE_THRESHOLD = 0.08

const LANGUAGE_ALIASES: Record<string, string> = {
  bat: 'bash',
  cpp: 'cpp',
  cs: 'csharp',
  html: 'html',
  js: 'javascript',
  json: 'json',
  md: 'markdown',
  ps1: 'powershell',
  py: 'python',
  sh: 'bash',
  tex: 'latex',
  ts: 'typescript',
  xml: 'html',
}

export interface CodeLanguageResult {
  language?: string
  confidence: number
  source: 'highlight.js' | 'ml' | 'none'
}

export type CodeLanguageDetector = (code: string) => Promise<CodeLanguageResult>

function normalizeLanguage(language?: string): string | undefined {
  if (!language) return undefined
  const normalized = language.trim().toLowerCase()
  return LANGUAGE_ALIASES[normalized] || normalized
}

export function detectCodeLanguageFast(code: string): CodeLanguageResult {
  const value = code.trim()
  if (!value) return { confidence: 0, source: 'none' }
  const result = hljs.highlightAuto(value, FAST_LANGUAGES)
  return {
    language: normalizeLanguage(result.language),
    confidence: result.relevance,
    source: 'highlight.js',
  }
}

let modelPromise: Promise<import('@vscode/vscode-languagedetection').ModelOperations> | null = null

async function fetchJsonAsset(path: string): Promise<Record<string, unknown>> {
  const response = await fetch(chrome.runtime.getURL(path))
  if (!response.ok) throw new Error('CODE_MODEL_JSON_LOAD_FAILED')
  return response.json() as Promise<Record<string, unknown>>
}

async function fetchBinaryAsset(path: string): Promise<ArrayBuffer> {
  const response = await fetch(chrome.runtime.getURL(path))
  if (!response.ok) throw new Error('CODE_MODEL_WEIGHTS_LOAD_FAILED')
  return response.arrayBuffer()
}

async function getLanguageModel() {
  if (!modelPromise) {
    modelPromise = import('@vscode/vscode-languagedetection').then(({ ModelOperations }) =>
      new ModelOperations({
        modelJsonLoaderFunc: () => fetchJsonAsset('model/model.json'),
        weightsLoaderFunc: () => fetchBinaryAsset('model/group1-shard1of1.bin'),
        minContentSize: 8,
        maxContentSize: 100_000,
      }),
    )
  }
  return modelPromise
}

export async function detectCodeLanguage(code: string): Promise<CodeLanguageResult> {
  const fast = detectCodeLanguageFast(code)
  if (!fast.language || code.trim().length < 8 || fast.confidence >= FAST_CONFIDENCE_THRESHOLD) {
    return fast
  }

  try {
    const model = await getLanguageModel()
    const result = (await model.runModel(code))[0]
    if (result && result.confidence >= ML_CONFIDENCE_THRESHOLD) {
      return {
        language: normalizeLanguage(result.languageId),
        confidence: result.confidence,
        source: 'ml',
      }
    }
  } catch {
    // The fast result remains usable when a local model asset cannot be loaded.
  }

  return fast
}

export async function enhanceMarkdownCodeLanguages(
  markdown: string,
  detector: CodeLanguageDetector = detectCodeLanguage,
): Promise<string> {
  const newline = markdown.includes('\r\n') ? '\r\n' : '\n'
  const lines = markdown.split(/\r?\n/)
  let changed = false

  for (let index = 0; index < lines.length; index++) {
    const opening = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(lines[index])
    if (!opening) continue

    const indent = opening[1]
    const marker = opening[2]
    const info = opening[3].trim()
    const markerChar = marker[0]
    const closingPattern = new RegExp(`^\\s*${markerChar === '`' ? '`' : '~'}{${marker.length},}\\s*$`)
    let closingIndex = index + 1
    while (closingIndex < lines.length && !closingPattern.test(lines[closingIndex])) {
      closingIndex++
    }

    if (closingIndex >= lines.length) continue

    if (!info) {
      const code = lines.slice(index + 1, closingIndex).join(newline)
      const detection = await detector(code)
      if (detection.language) {
        lines[index] = `${indent}${marker}${detection.language}`
        changed = true
      }
    }

    index = closingIndex
  }

  return changed ? lines.join(newline) : markdown
}

export async function enhanceExtractedContentCodeLanguages(
  content: ExtractedContent,
  detector: CodeLanguageDetector = detectCodeLanguage,
): Promise<ExtractedContent> {
  const cache = new Map<string, Promise<CodeLanguageResult>>()
  const cachedDetector: CodeLanguageDetector = (code) => {
    const key = code.trim()
    const existing = cache.get(key)
    if (existing) return existing
    const pending = detector(code)
    cache.set(key, pending)
    return pending
  }

  const markdown = await enhanceMarkdownCodeLanguages(content.markdown, cachedDetector)
  if (!content.clipDocument) return markdown === content.markdown ? content : { ...content, markdown }

  const blocks = await Promise.all(content.clipDocument.blocks.map(async (block) => {
    if (block.type !== 'code' || block.language) return block
    const detection = await cachedDetector(block.code)
    return detection.language ? { ...block, language: detection.language } : block
  }))

  return {
    ...content,
    markdown,
    clipDocument: {
      ...content.clipDocument,
      sourceMarkdown: markdown,
      blocks,
    },
  }
}
