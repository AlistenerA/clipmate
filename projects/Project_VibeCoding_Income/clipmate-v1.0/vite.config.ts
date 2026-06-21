/// <reference types="vitest" />
// Version: v1.0.1
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { createManifest } from './manifest.config'

const rootDir = dirname(fileURLToPath(import.meta.url))
const defaultLicenseApiBase: Record<string, string> = {
  development: 'https://cydl.site/api',
  staging: 'https://cydl.site/api',
  production: 'https://license.cydl.site/api',
  test: 'https://license.test/api'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, 'VITE_')
  const licenseApiBase = env.VITE_LICENSE_API_BASE || defaultLicenseApiBase[mode]
  if (!licenseApiBase) {
    throw new Error(`VITE_LICENSE_API_BASE is required for ${mode} builds`)
  }

  return {
    plugins: [react(), crx({ manifest: createManifest(licenseApiBase) })],
    define: {
      'import.meta.env.VITE_LICENSE_API_BASE': JSON.stringify(licenseApiBase)
    },
    build: {
      outDir: mode === 'staging' ? 'dist-staging' : 'dist',
      rollupOptions: {
        input: {
          popup: resolve(rootDir, 'src/popup/index.html'),
          options: resolve(rootDir, 'src/options/index.html'),
          onboarding: resolve(rootDir, 'src/onboarding/index.html')
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})
