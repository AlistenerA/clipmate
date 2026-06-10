export class ClipMateError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN',
  ) {
    super(message)
    this.name = 'ClipMateError'
  }
}

export const ErrorCodes = {
  NO_SELECTION: 'NO_SELECTION',
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  NO_ACTIVE_TAB: 'NO_ACTIVE_TAB',
  METADATA_PARSE_FAILED: 'METADATA_PARSE_FAILED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]
