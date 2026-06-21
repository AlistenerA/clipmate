// Version: v1.0.1
const configuredBase = import.meta.env.VITE_LICENSE_API_BASE
if (!configuredBase) {
  throw new Error('License API base is not configured')
}
const parsedBase = new URL(configuredBase)

if (parsedBase.protocol !== 'https:') {
  throw new Error('License API must use HTTPS')
}

export const LICENSE_API_BASE = parsedBase.toString().replace(/\/$/, '')
export const PURCHASE_URL = 'https://www.cydl.site/clipmate'
export const NOTION_INTEGRATION_URL = 'https://www.notion.so/my-integrations'
export const OFFLINE_GRACE_MS = 7 * 24 * 60 * 60 * 1000
export const REFRESH_THRESHOLD_MS = 6 * 60 * 60 * 1000
export const LICENSE_REFRESH_ALARM = 'clipmate-license-refresh'
