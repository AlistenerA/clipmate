import type { ExtractedContent } from '../../shared/types/clip.types'

interface Props {
  content: ExtractedContent | null
  loading: boolean
  error: string | null
}

export default function ContentPreview({ content, loading, error }: Props) {
  if (loading) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center animate-pulse">
        正在提取页面内容...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded border border-red-200">
        {error}
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center">
        点击上方按钮开始提取
      </div>
    )
  }

  const preview =
    content.contentText.slice(0, 500) +
    (content.contentText.length > 500 ? '…' : '')

  return (
    <div className="text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-1 truncate">
        {content.title}
      </h3>
      <p className="text-xs text-gray-400 mb-2 truncate">{content.url}</p>
      <div className="whitespace-pre-wrap break-words text-gray-600">
        {preview || '未提取到文字内容'}
      </div>
    </div>
  )
}
