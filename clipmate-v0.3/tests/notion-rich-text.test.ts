import { describe, it, expect } from 'vitest'
import { parseNotionRichText } from '../src/platforms/notion/notionRichText'

describe('parseNotionRichText', () => {
  it('parses plain text as single segment', () => {
    const result = parseNotionRichText('hello world')
    expect(result).toHaveLength(1)
    expect(result[0].text.content).toBe('hello world')
    expect(result[0].annotations.bold).toBe(false)
    expect(result[0].annotations.italic).toBe(false)
    expect(result[0].annotations.code).toBe(false)
  })

  it('parses **bold** with annotations', () => {
    const result = parseNotionRichText('hello **world** here')
    expect(result.length).toBeGreaterThanOrEqual(2)
    const boldSeg = result.find((s) => s.text.content === 'world')
    expect(boldSeg).toBeDefined()
    expect(boldSeg!.annotations.bold).toBe(true)
  })

  it('parses *italic* with annotations', () => {
    const result = parseNotionRichText('hello *world* here')
    const italicSeg = result.find((s) => s.text.content === 'world')
    expect(italicSeg).toBeDefined()
    expect(italicSeg!.annotations.italic).toBe(true)
  })

  it('parses `code` with annotations', () => {
    const result = parseNotionRichText('hello `code` here')
    const codeSeg = result.find((s) => s.text.content === 'code')
    expect(codeSeg).toBeDefined()
    expect(codeSeg!.annotations.code).toBe(true)
  })

  it('parses [text](url) with link', () => {
    const result = parseNotionRichText('hello [click](https://example.com) here')
    const linkSeg = result.find((s) => s.text.content === 'click')
    expect(linkSeg).toBeDefined()
    expect(linkSeg!.text.link).toEqual({ url: 'https://example.com' })
  })

  it('does not create link for javascript: URLs', () => {
    const result = parseNotionRichText('[click](javascript:alert(1))')
    const hasLink = result.some((s) => s.text.link?.url?.startsWith('javascript:'))
    expect(hasLink).toBe(false)
    expect(result.some((s) => s.text.content.includes('click'))).toBe(true)
  })

  it('handles empty string', () => {
    const result = parseNotionRichText('')
    expect(result).toHaveLength(1)
    expect(result[0].text.content).toBe('')
  })

  it('combines adjacent plain text segments', () => {
    const result = parseNotionRichText('hello world')
    expect(result).toHaveLength(1)
  })

  it('handles mixed inline styles', () => {
    const result = parseNotionRichText('text **bold** normal *italic* end')
    expect(result.length).toBeGreaterThanOrEqual(3)
  })
})
