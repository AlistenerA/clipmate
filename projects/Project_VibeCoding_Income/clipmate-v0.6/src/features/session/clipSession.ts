import type { ClipDraft } from '../../shared/types/clip.types'
import type { SaveToNotionPayload } from '../../shared/types/message.types'

export type ClipSessionStatus = 'draft' | 'saving' | 'saved' | 'failed'

export interface ClipSessionTarget {
  id?: string
  name?: string
  pageId?: string
}

export interface ClipSession {
  id: string
  draft: ClipDraft
  target?: ClipSessionTarget
  status: ClipSessionStatus
  saveAttemptCount: number
  createdAt: string
  updatedAt: string
  lastError?: string
}

export interface CreateClipSessionInput {
  id: string
  draft: ClipDraft
  target?: ClipSessionTarget
  now?: string
}

export function createClipSession(input: CreateClipSessionInput): ClipSession {
  const now = input.now || new Date().toISOString()
  return {
    id: input.id,
    draft: input.draft,
    target: input.target,
    status: 'draft',
    saveAttemptCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function markClipSessionSaving(session: ClipSession, now = new Date().toISOString()): ClipSession {
  return {
    ...session,
    status: 'saving',
    saveAttemptCount: session.saveAttemptCount + 1,
    updatedAt: now,
    lastError: undefined,
  }
}

export function markClipSessionSaved(session: ClipSession, now = new Date().toISOString()): ClipSession {
  return {
    ...session,
    status: 'saved',
    updatedAt: now,
    lastError: undefined,
  }
}

export function markClipSessionFailed(
  session: ClipSession,
  error: string,
  now = new Date().toISOString(),
): ClipSession {
  return {
    ...session,
    status: 'failed',
    updatedAt: now,
    lastError: error,
  }
}

export function createSaveToNotionPayloadFromSession(
  session: ClipSession,
  overrides: Partial<SaveToNotionPayload> = {},
): SaveToNotionPayload {
  return {
    draft: session.draft,
    targetId: session.target?.id,
    targetName: session.target?.name,
    pageId: session.target?.pageId || '',
    ...overrides,
  }
}
