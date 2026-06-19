import { useMemo, useState } from 'react'
import type { ClipMode, PageAwareness } from '../../shared/types/clip.types'
import {
  getAllClipModes,
  isClipMode,
  getModeLabel,
  getPageTypeLabel
} from '../../shared/utils/pageAwareModes'

interface Props {
  mode: ClipMode
  awareness?: PageAwareness
  onModeChange: (mode: ClipMode) => void
  disabled: boolean
}

const ALL_MODES = getAllClipModes()

export default function ClipModeToggle({ mode, awareness, onModeChange, disabled }: Props) {
  const [showAll, setShowAll] = useState(false)
  const visibleModes = useMemo(() => {
    if (!awareness || showAll) return ALL_MODES
    const primary = new Set(
      Array.isArray(awareness.primaryModes)
        ? awareness.primaryModes.filter((item) => ALL_MODES.includes(item))
        : []
    )
    primary.add(mode)
    return ALL_MODES.filter((item) => primary.has(item))
  }, [awareness, mode, showAll])
  const hasHiddenModes = visibleModes.length < ALL_MODES.length
  const recommendedMode = awareness && isClipMode(awareness.recommendedMode)
    ? awareness.recommendedMode
    : undefined
  const reason = typeof awareness?.reason === 'string'
    ? awareness.reason.slice(0, 160)
    : '页面推荐信息不可用，请手动选择剪藏模式。'

  const base =
    'relative flex-1 px-2 py-2 text-xs font-medium rounded transition-colors disabled:opacity-40'
  const active = 'bg-blue-600 text-white'
  const inactive = 'bg-white text-gray-600 hover:bg-gray-50'

  return (
    <section className="flex flex-col gap-1.5" aria-label="剪藏模式">
      {awareness ? (
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-medium text-gray-600">{getPageTypeLabel(awareness.pageType)}</span>
          {recommendedMode ? (
            <span className="text-blue-600">
              推荐：{getModeLabel(recommendedMode, awareness)}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg" role="group" aria-label="选择剪藏模式">
        {visibleModes.map((item) => {
          const recommended = recommendedMode === item
          return (
            <button
              key={item}
              type="button"
              className={`${base} ${mode === item ? active : inactive}`}
              disabled={disabled}
              aria-pressed={mode === item}
              onClick={() => onModeChange(item)}
            >
              {getModeLabel(item, awareness)}
              {recommended ? (
                <span className="ml-1 text-[9px] opacity-80" aria-label="推荐模式">推荐</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {awareness ? (
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] leading-4 text-gray-500">{reason}</p>
          {hasHiddenModes || showAll ? (
            <button
              type="button"
              className="shrink-0 text-[11px] text-blue-600 hover:text-blue-700 disabled:opacity-40"
              disabled={disabled}
              aria-expanded={showAll}
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? '收起' : '更多模式'}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
