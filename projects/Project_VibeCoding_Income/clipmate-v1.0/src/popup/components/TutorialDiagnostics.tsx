import type { UnknownResourceDiagnostic } from '../../features/document'

interface Props {
  resources: UnknownResourceDiagnostic[]
}

function hostLabel(url?: string): string | undefined {
  if (!url) return undefined
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

export default function TutorialDiagnostics({ resources }: Props) {
  if (resources.length === 0) return null

  return (
    <details className="rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs">
      <summary className="cursor-pointer font-medium text-amber-800">
        测试诊断：{resources.length} 个未知资源
      </summary>
      <div className="mt-2 flex flex-col gap-1.5">
        {resources.map((resource, index) => (
          <div key={`${resource.kind}-${resource.url || resource.label}-${index}`}>
            <span className="mr-1 rounded bg-amber-100 px-1 py-0.5 font-mono text-[10px] uppercase text-amber-700">
              {resource.kind}
            </span>
            <span className="text-gray-700">{resource.label}</span>
            {hostLabel(resource.url) && (
              <span className="ml-1 text-gray-400">({hostLabel(resource.url)})</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-amber-700">
        仅用于教程模式测试，不会复制或保存到 Notion。
      </p>
    </details>
  )
}
