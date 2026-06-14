interface Props {
  status: 'idle' | 'saving' | 'saved' | 'error'
  message: string
}

export default function SettingsStatus({ status, message }: Props) {
  if (status === 'idle') return null

  const bg =
    status === 'saving'
      ? 'bg-blue-50 text-blue-600'
      : status === 'saved'
        ? 'bg-green-50 text-green-600'
        : 'bg-red-50 text-red-500'

  return (
    <div className={`w-full px-4 py-2 text-sm rounded text-center ${bg}`}>
      {message}
    </div>
  )
}
