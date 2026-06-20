export function buildNotionPageUrl(pageId?: string): string | undefined {
  const normalized = pageId?.replace(/-/g, '').trim().toLowerCase()
  if (!normalized || !/^[a-f0-9]{32}$/.test(normalized)) return undefined
  return `https://www.notion.so/${normalized}`
}
