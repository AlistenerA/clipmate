// Version: v1.0.2
import type { ManifestV3Export } from '@crxjs/vite-plugin'

export function createManifest(licenseOrigin: string): ManifestV3Export {
  const origin = new URL(licenseOrigin)
  if (origin.protocol !== 'https:') {
    throw new Error('License API origin must use HTTPS')
  }

  return {
    manifest_version: 3,
    name: 'ClipMate',
    version: '1.0.2',
    description: '一键剪藏网页内容到 Notion',
    action: {
      default_popup: 'src/popup/index.html',
      default_title: 'ClipMate'
    },
    options_ui: {
      page: 'src/options/index.html',
      open_in_tab: true
    },
    background: {
      service_worker: 'src/background/index.ts',
      type: 'module'
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['src/content/index.ts']
      }
    ],
    icons: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png'
    },
    permissions: ['storage', 'activeTab', 'alarms'],
    host_permissions: ['https://api.notion.com/*', `${origin.origin}/*`]
  }
}
