import { ASSET_PICKER_MAX_SELECTION } from '../../features/assets'
import type { SelectedImageAsset } from '../../shared/types/clip.types'
import type { AssetPickerSessionState } from '../../shared/types/message.types'

interface Props {
  images: SelectedImageAsset[]
  session: AssetPickerSessionState | null
  error: string | null
  starting: boolean
  disabled?: boolean
  onStart: () => void
  onCancel: () => void
  onRemove: (index: number) => void
  onMove: (fromIndex: number, toIndex: number) => void
}

export default function AssetPickerPanel({
  images,
  session,
  error,
  starting,
  disabled,
  onStart,
  onCancel,
  onRemove,
  onMove
}: Props) {
  const active = session?.status === 'active'

  return (
    <section className="border border-gray-200 rounded bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-gray-800">手动补充图片</div>
          <div className="mt-0.5 text-[11px] text-gray-400">
            已选 {images.length}/{ASSET_PICKER_MAX_SELECTION}，仅保存在当前草稿
          </div>
        </div>
        {active ? (
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={onCancel}
          >
            取消选择
          </button>
        ) : (
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
            disabled={disabled || starting}
            onClick={onStart}
          >
            {starting ? '正在启动...' : '选择页面图片'}
          </button>
        )}
      </div>

      {active && (
        <div className="mt-2 rounded bg-blue-50 px-2 py-1.5 text-[11px] text-blue-700">
          回到网页点击图片，完成后重新打开 ClipMate。按 Escape 可取消。
        </div>
      )}

      {error && <div className="mt-2 text-[11px] text-red-600">{error}</div>}

      {images.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5 max-h-40 overflow-y-auto">
          {images.map((image, index) => (
            <div
              key={image.url}
              className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 p-1.5"
            >
              <img
                src={image.url}
                alt={image.alt || '已选网页图片'}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-10 w-14 shrink-0 rounded border border-gray-200 bg-white object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-medium text-gray-700">
                  {image.alt || image.caption || `图片 ${index + 1}`}
                </div>
                <div className="truncate text-[10px] text-gray-400">{image.url}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="上移图片"
                  title="上移"
                  disabled={index === 0}
                  className="px-1 text-xs text-gray-500 disabled:opacity-20"
                  onClick={() => onMove(index, index - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="下移图片"
                  title="下移"
                  disabled={index === images.length - 1}
                  className="px-1 text-xs text-gray-500 disabled:opacity-20"
                  onClick={() => onMove(index, index + 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="移除图片"
                  title="移除"
                  className="px-1 text-xs text-red-500"
                  onClick={() => onRemove(index)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
