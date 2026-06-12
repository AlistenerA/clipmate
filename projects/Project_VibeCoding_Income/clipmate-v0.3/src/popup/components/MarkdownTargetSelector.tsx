import { listMarkdownProfiles } from '../../shared/markdown/profiles'
import type { MarkdownTarget } from '../../shared/types/clip.types'

interface Props {
  selectedTarget: MarkdownTarget
  onChange: (target: MarkdownTarget) => void
}

const profiles = listMarkdownProfiles()

export default function MarkdownTargetSelector({ selectedTarget, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <label htmlFor="md-target" className="shrink-0">
        格式：
      </label>
      <select
        id="md-target"
        className="flex-1 px-2 py-1 border border-gray-200 rounded bg-white text-xs text-gray-700 focus:outline-none focus:border-blue-400"
        value={selectedTarget}
        onChange={(e) => onChange(e.target.value as MarkdownTarget)}
      >
        {profiles.map((p) => (
          <option key={p.target} value={p.target}>
            {p.label} - {p.description}
          </option>
        ))}
      </select>
    </div>
  )
}
