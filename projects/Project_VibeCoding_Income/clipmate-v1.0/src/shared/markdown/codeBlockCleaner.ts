export interface CleanCodeBlockInput {
  code: string
  language?: string
}

export interface CleanCodeBlockResult {
  code: string
  language?: string
  removedNoise: string[]
}

const KNOWN_LANGUAGES = new Set([
  'javascript', 'typescript', 'python', 'bash', 'shell', 'sh',
  'json', 'html', 'css', 'tsx', 'jsx', 'sql', 'yaml', 'yml',
  'markdown', 'md', 'xml', 'ruby', 'go', 'golang', 'rust', 'rs',
  'java', 'c', 'cpp', 'c++', 'csharp', 'c#', 'php', 'scala',
  'kotlin', 'swift', 'r', 'matlab', 'lua', 'perl', 'haskell',
  'elixir', 'erlang', 'clojure', 'dart', 'groovy', 'powershell',
  'ps1', 'makefile', 'dockerfile', 'diff', 'graphql', 'toml',
  'ini', 'env', 'vim', 'nginx', 'less', 'scss', 'sass', 'text',
  'plaintext', 'console', 'js', 'ts', 'py', 'rb',
])

function isCopyNoise(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  return /^>?\s*$/.test(trimmed) ? false :
    /^(?:>?\s*)?Copy(?:\s+code)?\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?Copied\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?复制\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?复制代码\s*$/i.test(trimmed)
}

function isUiNoise(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  return /^(?:>?\s*)?show\s+more\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?expand\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?collapse\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?展开\s*$/.test(trimmed) ||
    /^(?:>?\s*)?收起\s*$/.test(trimmed) ||
    /^(?:>?\s*)?view\s+raw\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?raw\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?toggle\s*$/i.test(trimmed) ||
    /^(?:>?\s*)?hide\s*$/i.test(trimmed)
}

function isStandaloneLanguageLabel(line: string): boolean {
  const trimmed = line.trim().toLowerCase()
  return KNOWN_LANGUAGES.has(trimmed)
}

function isShellPrompt(line: string): boolean {
  const trimmed = line.trimStart()
  return /^\$\s/.test(trimmed) ||
    /^>>>\s/.test(trimmed) ||
    /^\.\.\.\s/.test(trimmed) ||
    /^PS>\s?/.test(trimmed) ||
    /^PW>\s?/.test(trimmed) ||
    /^irb\([^)]*\)>/.test(trimmed) ||
    /^In\s*\[\d+\]\s*:/.test(trimmed)
}

export function normalizeCodeLanguage(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const v = value.trim().toLowerCase()
  const aliasMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'zsh': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'cs': 'csharp',
    'c#': 'csharp',
    'c++': 'cpp',
    'ps1': 'powershell',
    'ps': 'powershell',
    'rs': 'rust',
  }
  return aliasMap[v] ?? v
}

export function extractCleanLanguage(classStr: string): string | undefined {
  if (!classStr) return undefined
  const patterns = [
    /language-(\w+)/i,
    /lang-(\w+)/i,
    /highlight-source-(\w+)/i,
    /highlight-(\w+)/i,
    /brush:\s*(\w+)/i,
    /(\w+)/,
  ]
  for (const pattern of patterns) {
    const match = classStr.match(pattern)
    if (match) {
      return normalizeCodeLanguage(match[1])
    }
  }
  return undefined
}

function stripLineNumbers(lines: string[]): { lines: string[]; removed: string[] } {
  if (lines.length < 2) return { lines, removed: [] }

  const removed: string[] = []
  let result = [...lines]

  const prefixRegex = /^\s*(\d+)\s{2,}(\S)/
  let prefixCount = 0
  let countable = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !isShellPrompt(line)) {
      countable++
      if (prefixRegex.test(line)) {
        prefixCount++
      }
    }
  }

  if (countable >= 2 && prefixCount > countable / 2) {
    result = result.map(line => {
      if (isShellPrompt(line)) return line
      return line.replace(/^\s*\d+\s{2,}/, '')
    })
    removed.push('line-number-prefix')
  }

  const isolatedPattern = /^\s*\d+\s*$/
  const isolatedIndices: number[] = []
  for (let i = 0; i < result.length; i++) {
    if (isolatedPattern.test(result[i])) {
      isolatedIndices.push(i)
    }
  }

  if (isolatedIndices.length >= 3) {
    let sequential = true
    for (let i = 1; i < isolatedIndices.length; i++) {
      const prev = parseInt(result[isolatedIndices[i - 1]].trim())
      const curr = parseInt(result[isolatedIndices[i]].trim())
      if (curr !== prev + 1) {
        sequential = false
        break
      }
    }

    if (sequential) {
      const hasInterleavedCode = isolatedIndices.some((idx, i) => {
        if (i === 0) return false
        return idx - isolatedIndices[i - 1] === 2
      })

      if (hasInterleavedCode) {
        result = result.filter((_, i) => !isolatedIndices.includes(i))
        removed.push('isolated-line-numbers')
      }
    }
  }

  return { lines: result, removed }
}

export function cleanCodeBlock(input: CleanCodeBlockInput): CleanCodeBlockResult {
  const removedNoise: string[] = []
  const { code } = input

  if (!code || !code.trim()) {
    return { code, language: input.language, removedNoise }
  }

  let lines = code.split('\n')

  while (lines.length > 0 && isCopyNoise(lines[0])) {
    removedNoise.push(`copy-noise: ${lines[0].trim()}`)
    lines = lines.slice(1)
  }
  while (lines.length > 0 && isCopyNoise(lines[lines.length - 1])) {
    removedNoise.push(`copy-noise: ${lines[lines.length - 1].trim()}`)
    lines = lines.slice(0, -1)
  }

  if (lines.length === 0) {
    return { code: '', language: input.language, removedNoise }
  }

  if (lines.length > 1 && isStandaloneLanguageLabel(lines[0]) && lines[1].trim()) {
    removedNoise.push(`language-label: ${lines[0].trim()}`)
    lines = lines.slice(1)
  }
  while (lines.length > 1 && isStandaloneLanguageLabel(lines[lines.length - 1]) && lines[lines.length - 2].trim()) {
    removedNoise.push(`language-label: ${lines[lines.length - 1].trim()}`)
    lines = lines.slice(0, -1)
  }

  lines = lines.filter(line => {
    if (isUiNoise(line)) {
      removedNoise.push(`ui-noise: ${line.trim()}`)
      return false
    }
    return true
  })

  const afterLineNumbers = stripLineNumbers(lines)
  lines = afterLineNumbers.lines
  for (const r of afterLineNumbers.removed) {
    if (!removedNoise.includes(r)) {
      removedNoise.push(r)
    }
  }

  while (lines.length > 0 && !lines[0].trim()) {
    lines = lines.slice(1)
  }
  while (lines.length > 0 && !lines[lines.length - 1].trim()) {
    lines = lines.slice(0, -1)
  }

  return {
    code: lines.join('\n'),
    language: input.language,
    removedNoise,
  }
}

export function cleanMarkdownCodeBlocks(markdown: string): string {
  if (!markdown) return markdown

  const fenceRegex = /^```(\w*)[ \t]*\r?\n([\s\S]*?)\r?\n```/gm

  return markdown.replace(fenceRegex, (fullMatch, lang: string, content: string) => {
    const cleaned = cleanCodeBlock({ code: content, language: lang || undefined })
    const cleanLang = cleaned.language ?? lang
    return '```' + cleanLang + '\n' + cleaned.code + '\n```'
  })
}

export function preserveCodeFenceLanguage(markdown: string): string {
  if (!markdown) return markdown
  return markdown
}
