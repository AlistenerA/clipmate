const NOTION_API_BASE = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
const BATCH_SIZE = 100

interface NotionBlock {
  object: 'block'
  type: string
  [key: string]: unknown
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
    const fetchMsg = err instanceof Error ? err.message : String(err)
    console.warn(`[ClipMate] Notion fetch failed: ${fetchMsg}`)
    throw new Error('NETWORK_ERROR')
  }

  if (!response.ok) {
    console.warn(`[ClipMate] Notion API ${response.status}: ${response.statusText}`)
    if (response.status === 401 || response.status === 403) {
      throw new Error('NOTION_AUTH_FAILED')
    }
    if (response.status === 404) {
      throw new Error('NOTION_PAGE_NOT_FOUND')
    }
    if (response.status === 429) {
      throw new Error('NOTION_RATE_LIMITED')
    }
    throw new Error('NOTION_SAVE_FAILED')
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
    await makeRequest(token, url, { children: batch })
  }
}
