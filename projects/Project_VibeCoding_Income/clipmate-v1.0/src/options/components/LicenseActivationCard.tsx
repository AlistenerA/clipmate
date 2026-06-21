// Version: v1.0.1
import { useCallback, useEffect, useState } from 'react'
import { PURCHASE_URL } from '../../pro/config'
import { activateLicense, deactivateLicense, refreshToken } from '../../pro/proAuth'
import {
  LICENSE_STORAGE_KEYS,
  getLicenseAuthState
} from '../../pro/storage'
import type { LicenseActionResponse, LicenseAuthState } from '../../pro/types'

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_LICENSE_KEY: 'License Key 格式无效',
  LICENSE_NOT_FOUND: '未找到该 License',
  LICENSE_REVOKED: 'License 已被吊销',
  LICENSE_EXPIRED: 'License 已过期',
  DEVICE_LIMIT_REACHED: '已达到设备数量上限',
  INVALID_TOKEN: '授权凭证无效，请重新激活',
  TOKEN_EXPIRED: '授权凭证已超过续期宽限期，请重新激活',
  NETWORK_ERROR: '网络暂时不可用，现有授权会按离线宽限规则保留',
  INVALID_SERVER_RESPONSE: '授权服务器响应异常，请稍后重试',
  LICENSE_REQUEST_FAILED: '授权操作失败，请稍后重试',
  BACKGROUND_UNAVAILABLE: '扩展后台暂时不可用，请重新加载扩展后重试',
  INVALID_BACKGROUND_RESPONSE: '扩展后台响应异常，请重新加载扩展后重试'
}

export default function LicenseActivationCard() {
  const [auth, setAuth] = useState<LicenseAuthState | null>(null)
  const [licenseKey, setLicenseKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const loadAuth = useCallback(async () => {
    setAuth(await getLicenseAuthState())
  }, [])

  useEffect(() => {
    void loadAuth()
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName
    ) => {
      if (areaName === 'local' && changes[LICENSE_STORAGE_KEYS.AUTH]) void loadAuth()
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [loadAuth])

  const runAction = useCallback(
    async (action: () => Promise<LicenseActionResponse>, successMessage: string) => {
      setBusy(true)
      setMessage('')
      try {
        const response = await action()
        if (!response.success) {
          setIsError(true)
          setMessage(ERROR_MESSAGES[response.error] || `授权失败：${response.error}`)
          return
        }
        setIsError(false)
        setMessage(successMessage)
        setAuth(response.data)
      } catch {
        setIsError(true)
        setMessage('授权操作异常，请稍后重试')
      } finally {
        setBusy(false)
      }
    },
    []
  )

  const handleActivate = useCallback(async () => {
    const normalized = licenseKey.trim().toUpperCase()
    if (!normalized) {
      setIsError(true)
      setMessage('请输入 License Key')
      return
    }
    await runAction(() => activateLicense(normalized), '激活成功')
    setLicenseKey('')
  }, [licenseKey, runAction])

  const handleDeactivate = useCallback(async () => {
    if (!confirm('确定取消当前设备的 License 激活吗？')) return
    await runAction(deactivateLicense, '当前设备已取消激活')
  }, [runAction])

  return (
    <section className="bg-white p-4 rounded border border-gray-200 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">ClipMate Pro</h2>
          <p className="mt-1 text-xs text-gray-500">
            激活后可按套餐使用批量保存、AI 摘要等高级功能。
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
            auth ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {auth ? '已激活' : '免费版'}
        </span>
      </div>

      {auth ? (
        <div className="rounded bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
          <p>套餐：{auth.plan === 'lifetime' ? 'Lifetime' : 'Pro'}</p>
          <p>有效期：{auth.licenseExpiresAt ? formatDate(auth.licenseExpiresAt) : '永久'}</p>
          <p>
            设备：{auth.activeDevices}/{auth.maxDevices}
          </p>
          <p>最近验证：{formatDate(auth.lastVerifiedAt)}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={licenseKey}
            disabled={busy}
            maxLength={19}
            autoComplete="off"
            spellCheck={false}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:border-blue-500 focus:outline-none"
            onChange={(event) => setLicenseKey(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !busy) void handleActivate()
            }}
          />
          <button
            type="button"
            disabled={busy}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            onClick={() => void handleActivate()}
          >
            激活
          </button>
        </div>
      )}

      {message && (
        <p className={`text-xs ${isError ? 'text-red-600' : 'text-emerald-600'}`} role="status">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!auth && (
          <button
            type="button"
            className="rounded bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
            onClick={() => void chrome.tabs.create({ url: PURCHASE_URL })}
          >
            查看升级方案
          </button>
        )}
        {auth && (
          <>
            <button
              type="button"
              disabled={busy}
              className="rounded bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-40"
              onClick={() => void runAction(refreshToken, '授权状态已刷新')}
            >
              刷新授权
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-40"
              onClick={() => void handleDeactivate()}
            >
              取消激活
            </button>
          </>
        )}
      </div>
    </section>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '未知' : date.toLocaleString('zh-CN')
}
