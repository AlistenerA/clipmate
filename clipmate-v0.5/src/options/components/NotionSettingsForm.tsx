interface Props {
  token: string
  onChangeToken: (v: string) => void
  disabled: boolean
}

export default function NotionSettingsForm({
  token,
  onChangeToken,
  disabled,
}: Props) {
  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Notion 集成配置
      </h3>
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
    </div>
  )
}
