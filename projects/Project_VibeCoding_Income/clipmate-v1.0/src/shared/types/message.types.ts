import type { ExtractedContent, ClipDraft, SelectedImageAsset } from './clip.types'
import type { ClipMateSettings } from './settings.types'

export interface ClipMateMessage<T = string, P = unknown> {
  type: T
  payload?: P
}

export type ExtractPageResponse =
  | { success: true; data: ExtractedContent }
  | { success: false; error: string }

export type SelectionResponse =
  | { success: true; data: ExtractedContent }
  | { success: false; error: string }

export type SettingsResponse =
  | { success: true; data: ClipMateSettings }
  | { success: false; error: string }

export type SaveSettingsPayload = Partial<ClipMateSettings>

export type SaveLastClipPayload = ClipDraft

export type LastClipResponse =
  | { success: true; data: ClipDraft | null }
  | { success: false; error: string }

export interface SaveToNotionPayload {
  draft: ClipDraft
  targetId?: string
  targetName?: string
  pageId: string
  sourceHistoryId?: string
  historyWriteMode?: 'append' | 'update'
}

export type SaveToNotionResponse =
  | { success: true }
  | {
      success: false
      error: string
      details?: {
        httpStatus?: number
        apiCode?: string
        batch?: number
      }
    }

export type AssetPickerStatus = 'active' | 'completed' | 'cancelled'

export interface StartAssetPickerPayload {
  sessionId: string
  maxSelection: number
  selectedImages?: SelectedImageAsset[]
}

export interface AssetPickerSessionState {
  sessionId: string
  pageUrl: string
  status: AssetPickerStatus
  selectedImages: SelectedImageAsset[]
  candidateCount: number
  maxSelection: number
}

export type AssetPickerResponse =
  | { success: true; data: AssetPickerSessionState | null }
  | { success: false; error: string }

export interface AssetPickerSessionPayload {
  sessionId: string
}
