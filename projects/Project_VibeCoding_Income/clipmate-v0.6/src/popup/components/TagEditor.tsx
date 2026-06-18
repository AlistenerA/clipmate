import { useState } from 'react'

interface Props {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (index: number) => void
  disabled: boolean
}

export default function TagEditor({ tags, onAdd, onRemove, disabled }: Props) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addFromInput()
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags.length - 1)
    }
  }

  const addFromInput = () => {
    const parts = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    parts.forEach(onAdd)
    setInput('')
  }

  const handleBlur = () => {
    addFromInput()
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        标签
      </label>
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
          >
            {tag}
            <button
              className="text-blue-400 hover:text-blue-600 leading-none ml-0.5"
              disabled={disabled}
              onClick={() => onRemove(i)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
        placeholder={`标签（逗号或回车分隔）${tags.length > 0 ? '' : '，例如：技术,前端,React'}`}
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  )
}
