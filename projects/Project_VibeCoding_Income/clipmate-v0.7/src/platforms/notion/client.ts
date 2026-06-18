const NOTION_API_BASE = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
const BATCH_SIZE = 100

interface NotionBlock {
  object: 'block'
  type: string
  [key: string]: unknown
}

export interface NotionErrorDetails {
  httpStatus?: number
  apiCode?: string
  batch?: number
}

export class NotionApiError extends Error {
  constructor(
    public code: string,
    public details: NotionErrorDetails = {},
  ) {
    super(code)
    this.name = 'NotionApiError'
  }

  withBatch(batch: number): NotionApiError {
    return new NotionApiError(this.code, { ...this.details, batch })
  }
}

function safeApiCode(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z0-9_]{1,64}$/i.test(value)
    ? value
    : undefined
}

function errorCodeForResponse(status: number, apiCode?: string): string {
  if (status === 401 || status === 403 || apiCode === 'unauthorized' || apiCode === 'restricted_resource') {
    return 'NOTION_AUTH_FAILED'
  }
  if (status === 404 || apiCode === 'object_not_found') return 'NOTION_PAGE_NOT_FOUND'
  if (status === 409 || apiCode === 'conflict_error') return 'NOTION_CONFLICT'
  if (status === 429 || apiCode === 'rate_limited') return 'NOTION_RATE_LIMITED'
  if (status === 400 || apiCode === 'validation_error' || apiCode === 'invalid_json') {
    return 'NOTION_VALIDATION_ERROR'
  }
  if (status >= 500) return 'NOTION_SERVICE_UNAVAILABLE'
  return 'NOTION_SAVE_FAILED'
}

async function makeRequest(token: string, url: string, body: unknown): Promise<void> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.warn('[ClipMate] Notion request failed before receiving a response')
    throw new NotionApiError('NETWORK_ERROR')
  }

  if (!response.ok) {
    let apiCode: string | undefined
    try {
      const body = await response.json() as { code?: unknown }
      apiCode = safeApiCode(body?.code)
    } catch {
      apiCode = undefined
    }
    const code = errorCodeForResponse(response.status, apiCode)
    console.warn(`[ClipMate] Notion API request failed: ${code} (HTTP ${response.status})`)
    throw new NotionApiError(code, { httpStatus: response.status, apiCode })
  }
}

export async function appendBlocks(
  token: string,
  pageId: string,
  blocks: NotionBlock[],
): Promise<void> {
  const url = `${NOTION_API_BASE}/blocks/${pageId}/children`

  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE)
    try {
      await makeRequest(token, url, { children: batch })
    } catch (error) {
      if (error instanceof NotionApiError) {
        throw error.withBatch(Math.floor(i / BATCH_SIZE) + 1)
      }
      throw error
    }
  }
}
