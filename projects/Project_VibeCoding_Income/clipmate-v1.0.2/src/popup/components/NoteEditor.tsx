interface Props {
  note: string
  onChange: (note: string) => void
  disabled: boolean
}

export default function NoteEditor({ note, onChange, disabled }: Props) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        备注
      </label>
      <textarea
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none resize-none"
        rows={2}
        placeholder="添加备注（可选）"
        value={note}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
