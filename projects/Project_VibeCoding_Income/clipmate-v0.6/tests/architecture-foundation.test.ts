import { describe, expect, it } from 'vitest'
import {
  createClipDraft,
  getDraftBodyText,
  isDraftSaveable,
} from '../src/features/capture'
import {
  createClipSession,
  createSaveToNotionPayloadFromSession,
  markClipSessionFailed,
  markClipSessionSaved,
  markClipSessionSaving,
} from '../src/features/session'
import { createNotionSavePlan } from '../src/features/notion'
import type { ClipDraft, ExtractedContent } from '../src/shared/types/clip.types'

function makeContent(overrides: Partial<ExtractedContent> = {}): ExtractedContent {
  return {
    mode: 'fullpage',
    title: 'Architecture note',
    url: 'https://example.com/architecture',
    description: 'A note about architecture',
    contentText: 'Plain content',
    contentHtml: '<p>Plain content</p>',
    markdown: '# Markdown content',
    wordCount: 3,
    metadata: {
      url: 'https://example.com/architecture',
      title: 'Architecture note',
      description: 'A note about architecture',
      siteName: 'Example',
      createdAt: '2026-06-17T00:00:00.000Z',
    },
    ...overrides,
  }
}

function makeDraft(overrides: Partial<ClipDraft> = {}): ClipDraft {
  return {
    title: 'Architecture note',
    tags: ['clipmate', 'architecture'],
    note: 'session boundary',
    mode: 'fullpage',
    content: makeContent(),
    ...overrides,
  }
}

describe('architecture foundation capture module', () => {
  it('creates a draft from extracted content and copies mutable fields', () => {
    const tags = ['alpha']
    const content = makeContent({ mode: 'selection' })
    const draft = createClipDraft({ content, tags, note: 'note' })

    tags.push('beta')

    expect(draft.title).toBe(content.title)
    expect(draft.mode).toBe('selection')
    expect(draft.tags).toEqual(['alpha'])
    expect(draft.note).toBe('note')
  })

  it('prefers markdown and falls back to contentText for body text', () => {
    expect(getDraftBodyText(makeDraft())).toBe('# Markdown content')
    expect(
      getDraftBodyText(
        makeDraft({
          content: makeContent({
            markdown: '',
            contentText: 'Fallback text',
          }),
        }),
      ),
    ).toBe('Fallback text')
  })

  it('marks drafts without meaningful body text as not saveable', () => {
    const draft = makeDraft({
      content: makeContent({
        markdown: '   ',
        contentText: '',
      }),
    })

    expect(isDraftSaveable(draft)).toBe(false)
  })
})

describe('architecture foundation session module', () => {
  it('creates a draft session with timestamps and target metadata', () => {
    const draft = makeDraft()
    const session = createClipSession({
      id: 'session-1',
      draft,
      target: {
        id: 'target-1',
        name: 'Inbox',
        pageId: 'notion-page-1',
      },
      now: '2026-06-17T01:00:00.000Z',
    })

    expect(session.status).toBe('draft')
    expect(session.saveAttemptCount).toBe(0)
    expect(session.createdAt).toBe('2026-06-17T01:00:00.000Z')
    expect(session.updatedAt).toBe('2026-06-17T01:00:00.000Z')
    expect(session.target?.pageId).toBe('notion-page-1')
  })

  it('tracks save lifecycle without mutating the previous session object', () => {
    const session = createClipSession({
      id: 'session-1',
      draft: makeDraft(),
      now: '2026-06-17T01:00:00.000Z',
    })
    const saving = markClipSessionSaving(
      session,
      '2026-06-17T01:01:00.000Z',
    )
    const failed = markClipSessionFailed(
      saving,
      'NOTION_TOKEN_MISSING',
      '2026-06-17T01:02:00.000Z',
    )
    const saved = markClipSessionSaved(
      failed,
      '2026-06-17T01:03:00.000Z',
    )

    expect(session.status).toBe('draft')
    expect(saving.status).toBe('saving')
    expect(saving.saveAttemptCount).toBe(1)
    expect(failed.status).toBe('failed')
    expect(failed.lastError).toBe('NOTION_TOKEN_MISSING')
    expect(saved.status).toBe('saved')
    expect(saved.lastError).toBeUndefined()
  })

  it('creates a SaveToNotion payload from session target data', () => {
    const session = createClipSession({
      id: 'session-1',
      draft: makeDraft(),
      target: {
        id: 'target-1',
        name: 'Inbox',
        pageId: 'notion-page-1',
      },
    })

    const payload = createSaveToNotionPayloadFromSession(session, {
      sourceHistoryId: 'history-1',
      historyWriteMode: 'update',
    })

    expect(payload.pageId).toBe('notion-page-1')
    expect(payload.targetId).toBe('target-1')
    expect(payload.targetName).toBe('Inbox')
    expect(payload.sourceHistoryId).toBe('history-1')
    expect(payload.historyWriteMode).toBe('update')
  })
})

describe('architecture foundation notion module', () => {
  it('keeps existing validation errors in the save planning boundary', () => {
    const draft = makeDraft()

    expect(
      createNotionSavePlan({ notionToken: '' }, { draft, pageId: 'page-1' }),
    ).toEqual({ success: false, error: 'NOTION_TOKEN_MISSING' })

    expect(
      createNotionSavePlan({ notionToken: 'secret-token' }, { draft, pageId: '' }),
    ).toEqual({ success: false, error: 'NOTION_PAGE_ID_MISSING' })

    expect(
      createNotionSavePlan(
        { notionToken: 'secret-token' },
        {
          draft: makeDraft({
            content: makeContent({ markdown: ' ', contentText: '' }),
          }),
          pageId: 'page-1',
        },
      ),
    ).toEqual({ success: false, error: 'CONTENT_EMPTY' })
  })

  it('creates a Notion save plan for a valid payload', () => {
    const draft = makeDraft()
    const result = createNotionSavePlan(
      { notionToken: 'secret-token' },
      {
        draft,
        pageId: 'page-1',
        targetId: 'target-1',
        targetName: 'Inbox',
        sourceHistoryId: 'history-1',
        historyWriteMode: 'update',
      },
    )

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.plan.token).toBe('secret-token')
    expect(result.plan.pageId).toBe('page-1')
    expect(result.plan.contentText).toBe('# Markdown content')
    expect(result.plan.isRetryUpdate).toBe(true)
    expect(result.plan.sourceHistoryId).toBe('history-1')
    expect(result.plan.targetName).toBe('Inbox')
    expect(result.plan.blocks.length).toBeGreaterThan(0)
  })
})
