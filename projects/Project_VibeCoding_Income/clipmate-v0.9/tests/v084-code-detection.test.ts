import { JSDOM } from 'jsdom'
import { extractFullpage } from '../src/content/extractors/readabilityExtractor'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'
import {
  detectCodeLanguageFast,
  enhanceExtractedContentCodeLanguages,
  enhanceMarkdownCodeLanguages,
  type CodeLanguageDetector,
} from '../src/shared/markdown/codeLanguageDetection'
import type { ExtractedContent } from '../src/shared/types/clip.types'

const typescriptDetector: CodeLanguageDetector = async () => ({
  language: 'typescript',
  confidence: 0.95,
  source: 'ml',
})

describe('v0.8.4 hybrid code detection', () => {
  it('extracts SyntaxHighlighter layout tables as fenced code without gutter numbers', () => {
    const markdown = htmlToMarkdown(`
      <div class="syntaxhighlighter xhtml">
        <table><tbody><tr>
          <td class="gutter"><div class="line">1</div><div class="line">2</div></td>
          <td class="code"><div class="container">
            <div class="line"><code>&lt;main&gt;</code></div>
            <div class="line"><code>&lt;/main&gt;</code></div>
          </div></td>
        </tr></tbody></table>
      </div>
    `)

    expect(markdown).toContain('```html\n<main>\n</main>\n```')
    expect(markdown).not.toContain('| Column 1 |')
    expect(markdown).not.toContain('\n1\n2\n')
  })

  it('keeps one-line site examples inside a code fence through Readability', () => {
    const page = new JSDOM(`<!doctype html><html><body><article>
      <h1>TypeScript</h1><p>${'正文内容。'.repeat(30)}</p>
      <div class="example_code">type ID = string | number;</div>
      <p>${'补充说明。'.repeat(30)}</p>
    </article></body></html>`, { url: 'https://example.com/typescript' }).window.document
    const extracted = extractFullpage(page)
    const markdown = htmlToMarkdown(extracted?.content || '')

    expect(markdown).toContain('```\ntype ID = string | number;\n```')
  })

  it('uses the restricted highlight.js fast path for distinctive code', () => {
    const result = detectCodeLanguageFast('interface User {\n  name: string\n}\nconst user: User = { name: "A" }')
    expect(result.language).toBe('typescript')
    expect(result.source).toBe('highlight.js')
  })

  it('fills a missing fence language with the low-confidence detector result', async () => {
    const markdown = await enhanceMarkdownCodeLanguages(
      '正文\n\n```\ntype ID = string | number;\n```',
      typescriptDetector,
    )
    expect(markdown).toContain('```typescript\ntype ID = string | number;\n```')
  })

  it('updates tutorial document code blocks and source Markdown together', async () => {
    const content = {
      mode: 'tutorial',
      title: 'Short code',
      url: 'https://example.com/code',
      description: '',
      contentText: 'type ID = string | number;',
      contentHtml: '',
      markdown: '```\ntype ID = string | number;\n```',
      wordCount: 6,
      metadata: {
        url: 'https://example.com/code',
        title: 'Short code',
        description: '',
        siteName: 'Example',
        createdAt: '2026-06-19T00:00:00.000Z',
      },
      clipDocument: {
        schemaVersion: 1,
        mode: 'tutorial',
        title: 'Short code',
        url: 'https://example.com/code',
        sourceMarkdown: '```\ntype ID = string | number;\n```',
        blocks: [{ type: 'code', code: 'type ID = string | number;' }],
        stats: {
          headingCount: 0,
          listCount: 0,
          codeBlockCount: 1,
          formulaCount: 0,
          tableCount: 0,
          calloutCount: 0,
          figureCount: 0,
          videoCount: 0,
        },
      },
    } satisfies ExtractedContent

    const enhanced = await enhanceExtractedContentCodeLanguages(content, typescriptDetector)
    expect(enhanced.markdown).toContain('```typescript')
    expect(enhanced.clipDocument?.blocks[0]).toMatchObject({
      type: 'code',
      language: 'typescript',
    })
  })
})
