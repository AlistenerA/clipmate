interface Props {
  token: string
  pageId: string
  onChangeToken: (v: string) => void
  onChangePageId: (v: string) => void
  disabled: boolean
}

export default function NotionSettingsForm({
  token,
  pageId,
  onChangeToken,
  onChangePageId,
  disabled,
}: Props) {
  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Notion 集成配置
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Notion Integration Token
          </label>
          <input
            type="password"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:bg-gray-50"
            placeholder="secret_xxxxxxxxxxxxx"
            value={token}
            disabled={disabled}
            onChange={(e) => onChangeToken(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-0.5">
            在 Notion 开发者页面创建 Integration 后获取
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Notion Page ID
          </label>
          <input
            type="text"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:bg-gray-50"
            placeholder="从 Notion 页面 URL 中获取（32位十六进制）"
            value={pageId}
            disabled={disabled}
            onChange={(e) => onChangePageId(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-0.5">
            页面 URL 中 notion.so/&#123;name&#125;-&#123;pageId&#125; 的最后 32 位
          </p>
        </div>
      </div>
    </div>
  )
}
