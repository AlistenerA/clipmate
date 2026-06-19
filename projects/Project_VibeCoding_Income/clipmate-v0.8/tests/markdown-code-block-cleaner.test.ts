import { describe, it, expect } from 'vitest'
import {
  cleanCodeBlock,
  cleanMarkdownCodeBlocks,
  normalizeCodeLanguage,
  extractCleanLanguage,
} from '../src/shared/markdown/codeBlockCleaner'

describe('normalizeCodeLanguage', () => {
  it('returns alias for js', () => {
    expect(normalizeCodeLanguage('js')).toBe('javascript')
  })

  it('returns alias for ts', () => {
    expect(normalizeCodeLanguage('ts')).toBe('typescript')
  })

  it('returns alias for py', () => {
    expect(normalizeCodeLanguage('py')).toBe('python')
  })

  it('returns alias for sh', () => {
    expect(normalizeCodeLanguage('sh')).toBe('bash')
  })

  it('returns alias for yml', () => {
    expect(normalizeCodeLanguage('yml')).toBe('yaml')
  })

  it('passes through unknown language', () => {
    expect(normalizeCodeLanguage('foobar')).toBe('foobar')
  })

  it('returns undefined for null', () => {
    expect(normalizeCodeLanguage(null)).toBeUndefined()
  })

  it('returns undefined for undefined', () => {
    expect(normalizeCodeLanguage(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(normalizeCodeLanguage('')).toBeUndefined()
  })
})

describe('extractCleanLanguage', () => {
  it('extracts from language-javascript', () => {
    expect(extractCleanLanguage('language-javascript')).toBe('javascript')
  })

  it('extracts from lang-python', () => {
    expect(extractCleanLanguage('lang-python')).toBe('python')
  })

  it('extracts from highlight-source-ts', () => {
    expect(extractCleanLanguage('highlight-source-ts')).toBe('typescript')
  })

  it('extracts from brush: bash', () => {
    expect(extractCleanLanguage('brush: bash')).toBe('bash')
  })

  it('returns undefined for empty string', () => {
    expect(extractCleanLanguage('')).toBeUndefined()
  })

  it('normalizes js to javascript from class', () => {
    expect(extractCleanLanguage('language-js')).toBe('javascript')
  })
})

describe('cleanCodeBlock', () => {
  it('removes first line Copy button text', () => {
    const result = cleanCodeBlock({ code: 'Copy\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
    expect(result.removedNoise).toContain('copy-noise: Copy')
  })

  it('removes last line Copied', () => {
    const result = cleanCodeBlock({ code: 'const x = 1\nCopied' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes leading Copy code', () => {
    const result = cleanCodeBlock({ code: 'Copy code\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes leading 复制', () => {
    const result = cleanCodeBlock({ code: '复制\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes leading 复制代码', () => {
    const result = cleanCodeBlock({ code: '复制代码\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes standalone language label first line', () => {
    const result = cleanCodeBlock({ code: 'python\nprint("hello")' })
    expect(result.code).toBe('print("hello")')
    expect(result.removedNoise).toContain('language-label: python')
  })

  it('removes standalone language label last line', () => {
    const result = cleanCodeBlock({ code: 'print("hello")\njavascript' })
    expect(result.code).toBe('print("hello")')
  })

  it('does not remove language label if only one line', () => {
    const result = cleanCodeBlock({ code: 'python' })
    expect(result.code).toBe('python')
  })

  it('removes show more line', () => {
    const result = cleanCodeBlock({ code: 'show more\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
    expect(result.removedNoise).toContain('ui-noise: show more')
  })

  it('removes expand line', () => {
    const result = cleanCodeBlock({ code: 'const x = 1\nexpand' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes collapse line', () => {
    const result = cleanCodeBlock({ code: 'collapse\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes 展开 line', () => {
    const result = cleanCodeBlock({ code: '展开\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes 收起 line', () => {
    const result = cleanCodeBlock({ code: 'const x = 1\n收起' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes view raw line', () => {
    const result = cleanCodeBlock({ code: 'view raw\nconst x = 1' })
    expect(result.code).toBe('const x = 1')
  })

  it('removes line number prefixes when majority have them', () => {
    const code = '1  const x = 1\n2  const y = 2\n3  console.log(x)'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('const x = 1\nconst y = 2\nconsole.log(x)')
  })

  it('removes isolated line number column', () => {
    const code = '1\nconst x = 1\n2\nconst y = 2\n3\nconst z = 3'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('const x = 1\nconst y = 2\nconst z = 3')
  })

  it('preserves real indentation and blank lines', () => {
    const code = '  def foo():\n      pass\n\n  foo()'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('  def foo():\n      pass\n\n  foo()')
  })

  it('preserves shell prompt $ npm run build', () => {
    const code = '$ npm run build\n$ npm test'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('$ npm run build\n$ npm test')
  })

  it('preserves Python REPL prompt >>>', () => {
    const code = '>>> print(1)\n1\n>>> x = 2'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('>>> print(1)\n1\n>>> x = 2')
  })

  it('preserves PowerShell prompt PS>', () => {
    const code = 'PS> npm test\nPS> npm run build'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('PS> npm test\nPS> npm run build')
  })

  it('does not remove "copy" inside a string', () => {
    const code = 'const label = "copy file"'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('const label = "copy file"')
  })

  it('does not remove "copy" inside a comment', () => {
    const code = '// copy the array'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('// copy the array')
  })

  it('does not flag standalone numbers below 2 lines as line numbers', () => {
    const code = '42\nconst x = 1'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('42\nconst x = 1')
  })

  it('preserves language in result', () => {
    const result = cleanCodeBlock({ code: 'print("hello")', language: 'python' })
    expect(result.language).toBe('python')
    expect(result.code).toBe('print("hello")')
  })

  it('handles empty code block', () => {
    const result = cleanCodeBlock({ code: '' })
    expect(result.code).toBe('')
    expect(result.removedNoise).toHaveLength(0)
  })

  it('handles only-noise code block', () => {
    const result = cleanCodeBlock({ code: 'Copy code\nCopied' })
    expect(result.code).toBe('')
  })

  it('handles whitespace-only noise line', () => {
    const result = cleanCodeBlock({ code: 'Copy\n   \nconst x = 1' })
    expect(result.code).toBe('const x = 1')
  })

  it('preserves inline code numbers', () => {
    const code = 'const x = 1\nstatus = 404\nitems[0] = "first"'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('const x = 1\nstatus = 404\nitems[0] = "first"')
  })

  it('does not strip single line number prefix', () => {
    const code = '1  special case\nconst y = 2'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('1  special case\nconst y = 2')
  })

  it('preserves code with repeated backticks', () => {
    const code = 'const md = "```markdown\\n"'
    const result = cleanCodeBlock({ code })
    expect(result.code).toBe('const md = "```markdown\\n"')
  })
})

describe('cleanMarkdownCodeBlocks', () => {
  it('cleans code inside fenced block', () => {
    const md = '```python\nCopy\nprint("hello")\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```python\nprint("hello")\n```')
  })

  it('cleans multiple fenced code blocks', () => {
    const md = '```js\nCopy\nconst x = 1\n```\n\ntext\n\n```python\nCopied\nprint("hi")\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```js\nconst x = 1\n```\n\ntext\n\n```python\nprint("hi")\n```')
  })

  it('does not modify text outside code blocks', () => {
    const md = 'Some text Copy here\n\nnot a code block'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('Some text Copy here\n\nnot a code block')
  })

  it('does not modify inline code', () => {
    const md = 'Use `Copy` to copy text'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('Use `Copy` to copy text')
  })

  it('preserves code block language', () => {
    const md = '```javascript\nconsole.log("hi")\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```javascript\nconsole.log("hi")\n```')
  })

  it('handles no-language code block', () => {
    const md = '```\nCopy\nsome code\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```\nsome code\n```')
  })

  it('handles markdown without code blocks', () => {
    const result = cleanMarkdownCodeBlocks('# Title\n\nParagraph')
    expect(result).toBe('# Title\n\nParagraph')
  })

  it('handles empty string', () => {
    expect(cleanMarkdownCodeBlocks('')).toBe('')
  })

  it('cleans standalone language label in fence', () => {
    const md = '```\npython\nprint("hello")\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```\nprint("hello")\n```')
  })

  it('cleans line numbers in fenced block', () => {
    const md = '```\n1  const x = 1\n2  const y = 2\n3  const z = 3\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```\nconst x = 1\nconst y = 2\nconst z = 3\n```')
  })

  it('preserves shell prompts in fenced block', () => {
    const md = '```bash\n$ npm install\n$ npm test\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```bash\n$ npm install\n$ npm test\n```')
  })

  it('cleans expand/collapse from fenced block', () => {
    const md = '```\nexpand\ncollapse\ncode here\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('```\ncode here\n```')
  })
})

describe('Session 2 LaTeX formula integration', () => {
  it('does not affect math formulas outside code blocks', () => {
    const md = '$x^2 + y^2 = z^2$\n\n```python\nx = 1\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toBe('$x^2 + y^2 = z^2$\n\n```python\nx = 1\n```')
  })

  it('does not affect display math blocks', () => {
    const md = '$$\nx^2 + y^2 = z^2\n$$\n\n```\ncode\n```'
    const result = cleanMarkdownCodeBlocks(md)
    expect(result).toContain('$$\nx^2 + y^2 = z^2\n$$')
    expect(result).toContain('```\ncode\n```')
  })
})
