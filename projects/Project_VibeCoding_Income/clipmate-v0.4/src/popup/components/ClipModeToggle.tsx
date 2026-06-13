import type { ClipMode } from '../../shared/types/clip.types'

interface Props {
  mode: ClipMode
  onModeChange: (mode: ClipMode) => void
  disabled: boolean
}

export default function ClipModeToggle({ mode, onModeChange, disabled }: Props) {
  const base =
    'flex-1 px-3 py-2 text-sm font-medium rounded transition-colors disabled:opacity-40'
  const active = 'bg-blue-600 text-white'
  const inactive = 'bg-gray-100 text-gray-600 hover:bg-gray-200'

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      <button
        className={`${base} ${mode === 'fullpage' ? active : inactive}`}
        disabled={disabled}
        onClick={() => onModeChange('fullpage')}
      >
        全文
      </button>
      <button
        className={`${base} ${mode === 'selection' ? active : inactive}`}
        disabled={disabled}
        onClick={() => onModeChange('selection')}
      >
        选区
      </button>
    </div>
  )
}
