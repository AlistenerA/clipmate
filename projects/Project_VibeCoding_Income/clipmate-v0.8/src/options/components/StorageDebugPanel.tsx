import type { ClipMateSettingsV2 } from '../../shared/types/settings.types'

interface Props {
  settings: ClipMateSettingsV2
}

function maskToken(token: string): string {
  if (!token) return '（未设置）'
  if (token.length <= 8) return '*'.repeat(token.length)
  return token.slice(0, 4) + '*'.repeat(token.length - 8) + token.slice(-4)
}

export default function StorageDebugPanel({ settings }: Props) {
  return (
    <div className="bg-gray-50 p-4 rounded border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        当前配置概览
      </h3>
      <div className="space-y-1 text-xs font-mono text-gray-600">
        <div>
          Token：<span className="text-gray-400">{maskToken(settings.notionToken)}</span>
        </div>
        <div>
          保存目标：{settings.notionTargets.length} 个
          {settings.notionTargets.length > 0 &&
            `（${settings.notionTargets.map((t) => t.name).join('、')}）`}
        </div>
        <div>
          默认标签：{settings.defaultTags.length > 0 ? settings.defaultTags.join(', ') : '（未设置）'}
        </div>
        <div>
          历史记录上限：{settings.historyLimit}
        </div>
        <div>
          剪藏历史：{settings.saveHistoryEnabled ? '开启' : '关闭'}
        </div>
      </div>
    </div>
  )
}
