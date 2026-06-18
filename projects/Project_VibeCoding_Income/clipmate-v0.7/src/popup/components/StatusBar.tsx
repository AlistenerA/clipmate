import type { ClipMode } from '../../shared/types/clip.types'

interface Props {
  mode: ClipMode
  wordCount: number
  modeLabel: 'idle' | 'loading' | 'success' | 'error'
  imageCount?: number
}

export default function StatusBar({ mode, wordCount, modeLabel, imageCount }: Props) {
  const hasImages = (imageCount ?? 0) > 0
  const statusText =
    modeLabel === 'loading'
      ? '提取中…'
      : modeLabel === 'error'
        ? '提取失败'
        : modeLabel === 'success'
          ? `${wordCount} 字`
          : '就绪'

  const bgColor =
    modeLabel === 'loading'
      ? 'bg-blue-50 text-blue-600'
      : modeLabel === 'error'
        ? 'bg-red-50 text-red-500'
        : modeLabel === 'success'
          ? 'bg-green-50 text-green-600'
          : 'bg-gray-50 text-gray-400'

  const modeText = mode === 'fullpage' ? '全文' : mode === 'selection' ? '选区' : '教程'

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded ${bgColor}`}>{statusText}</span>
        {hasImages && (
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600">
            图片 {imageCount}
          </span>
        )}
      </div>
      <span className="text-gray-400">模式：{modeText}</span>
    </div>
  )
}
