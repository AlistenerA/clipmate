import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { detectPageAwareness } from '../src/content/pageAwareness'
import { extractAiConversation, resolveAiConversationRole } from '../src/content/aiConversation'
import { detectPageTypeFromDocument } from '../src/shared/utils/pageTypeDetector'

function loadFixture(name: string, url: string): JSDOM {
  const html = readFileSync(resolve('tests', 'fixtures', 'v092', name), 'utf8')
  return new JSDOM(html, { url })
}

describe('v0.9.2 multi-signal page awareness', () => {
  it('prefers AI conversation over article-like scoring on DeepSeek', () => {
    const dom = loadFixture(
      'deepseek-conversation.html',
      'https://chat.deepseek.com/a/chat/s/example',
    )

    const detection = detectPageTypeFromDocument(dom.window.document)
    const awareness = detectPageAwareness(dom.window.document, false)

    expect(detection.type).toBe('ai-answer')
    expect(detection.candidates?.some((candidate) => candidate.type === 'article')).toBe(true)
    expect(awareness.recommendedMode).toBe('tutorial')
    expect(awareness.autoApply).toBe(true)
    expect(awareness.characteristics?.some((item) => item.type === 'ai-answer')).toBe(true)
    expect(awareness).not.toHaveProperty('signals')
  })

  it('recognizes GitHub issue, pull request and discussion routes', () => {
    for (const path of [
      '/owner/repo/issues/42',
      '/owner/repo/pull/42',
      '/owner/repo/discussions/42',
    ]) {
      const dom = new JSDOM(`<!doctype html><html><body>
        <main><article><h1>Regression report</h1><p>${'Issue body. '.repeat(40)}</p></article>
        <div class="timeline-comment"><p>Maintainer reply</p></div></main>
      </body></html>`, { url: `https://github.com${path}` })
      expect(detectPageTypeFromDocument(dom.window.document).type).toBe('forum-or-comment')
    }
  })

  it('auto-applies adaptive mode only for high-confidence technical articles', () => {
    const technical = loadFixture(
      'runoob-technical.html',
      'https://www.runoob.com/typescript/tutorial.html',
    )
    const incidental = new JSDOM(`<!doctype html><html><head><title>普通文章</title></head><body>
      <article><h1>普通文章</h1><p>${'正文说明。'.repeat(80)}</p>
      <pre><code>one line</code></pre></article>
    </body></html>`, { url: 'https://example.com/article' })

    const technicalAwareness = detectPageAwareness(technical.window.document, false)
    const incidentalAwareness = detectPageAwareness(incidental.window.document, false)
    expect(technicalAwareness.characteristics).toContainEqual({
      type: 'technical',
      confidence: 1,
    })
    expect(technicalAwareness.autoApply).toBe(true)
    expect(incidentalAwareness.autoApply).toBe(false)
  })
})

describe('v0.9.2 AI conversation extraction', () => {
  it('keeps ordered DeepSeek user and assistant turns while removing transient reasoning', () => {
    const dom = loadFixture(
      'deepseek-conversation.html',
      'https://chat.deepseek.com/a/chat/s/example',
    )

    const extraction = extractAiConversation(dom.window.document)
    expect(extraction?.turns.map((turn) => turn.role)).toEqual(['user', 'assistant'])
    expect(extraction?.markdown).toContain('## 用户\n\n两个矩阵相乘需要什么条件？')
    expect(extraction?.markdown).toContain('## 助手')
    expect(extraction?.markdown).toContain('```')
    expect(extraction?.markdown).not.toContain('临时思考过程')
    expect(extraction?.markdown).not.toContain('复制')
  })

  it('supports ChatGPT role attributes and resolves selection roles', () => {
    const dom = new JSDOM(`<!doctype html><html><body><main>
      <article data-message-author-role="user"><p id="question">How?</p></article>
      <article data-message-author-role="assistant"><div class="markdown"><p>Like this.</p></div></article>
    </main></body></html>`, { url: 'https://chatgpt.com/c/example' })
    const extraction = extractAiConversation(dom.window.document)
    const question = dom.window.document.querySelector('#question')

    expect(extraction?.turns.map((turn) => turn.role)).toEqual(['user', 'assistant'])
    expect(resolveAiConversationRole(question, dom.window.document)).toBe('user')
  })

  it('supports Doubao message bubbles without saving suggestions', () => {
    const dom = loadFixture(
      'doubao-conversation.html',
      'https://www.doubao.com/chat/example',
    )
    const extraction = extractAiConversation(dom.window.document)

    expect(extraction?.turns.map((turn) => turn.role)).toEqual(['user', 'assistant'])
    expect(extraction?.markdown).toContain('豆包回答')
    expect(extraction?.markdown).not.toContain('推荐问题')
  })
})
