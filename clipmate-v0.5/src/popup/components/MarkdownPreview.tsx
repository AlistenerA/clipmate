import {
  parseMarkdownPreview,
  sanitizePreviewText,
  isSafePreviewHref,
} from '../../shared/markdown/markdownPreview'
import type {
  InlineSegment,
  MarkdownPreviewBlock,
} from '../../shared/markdown/markdownPreview'

interface Props {
  markdown: string
}

function InlineRenderer({ segment }: { segment: InlineSegment }) {
  switch (segment.type) {
    case 'text':
      return <>{segment.text}</>
    case 'bold':
      return <strong className="font-semibold">{segment.text}</strong>
    case 'italic':
      return <em className="italic">{segment.text}</em>
    case 'code':
      return (
        <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono text-red-700">
          {segment.text}
        </code>
      )
    case 'link': {
      const safe = isSafePreviewHref(segment.href)
      if (safe) {
        return (
          <a
            href={segment.href}
            rel="noreferrer noopener"
            className="text-blue-600 underline"
          >
            {segment.text}
          </a>
        )
      }
      return <span className="text-gray-500 line-through">{segment.text}</span>
    }
    case 'image':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
          <span>image</span>
          {segment.alt && <span>{segment.alt}</span>}
        </span>
      )
    case 'formula':
      return (
        <span className="px-1 text-xs font-mono text-purple-700 bg-purple-50 rounded">
          {segment.text}
        </span>
    )
    default:
      return null
  }
}

function SegmentsRenderer({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((seg, idx) => (
        <InlineRenderer key={idx} segment={seg} />
      ))}
    </>
  )
}

function BlockRenderer({ block }: { block: MarkdownPreviewBlock }) {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements
      const sizeClass =
        block.level <= 2
          ? 'text-base font-bold'
          : block.level <= 4
            ? 'text-sm font-semibold'
            : 'text-xs font-semibold'
      return (
        <Tag className={`${sizeClass} text-gray-900 mt-2 first:mt-0 mb-0.5`}>
          <SegmentsRenderer segments={block.segments} />
        </Tag>
      )
    }

    case 'paragraph':
      return (
        <p className="text-xs text-gray-700 leading-relaxed my-1">
          <SegmentsRenderer segments={block.segments} />
        </p>
      )

    case 'blockquote':
      return (
        <blockquote className="border-l-2 border-gray-300 pl-2 my-1 text-xs text-gray-500 italic">
          <SegmentsRenderer segments={block.segments} />
        </blockquote>
      )

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      const listClass = block.ordered ? 'list-decimal' : 'list-disc'
      return (
        <ListTag className={`${listClass} pl-4 my-1 text-xs text-gray-700 space-y-0.5`}>
          {block.items.map((item, idx) => (
            <li key={idx}>
              <SegmentsRenderer segments={item} />
            </li>
          ))}
        </ListTag>
      )
    }

    case 'code':
      return (
        <pre className="my-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-x-auto max-h-32">
          <code>
            {block.code}
          </code>
        </pre>
      )

    case 'table':
      return (
        <div className="my-1 overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            {block.header.length > 0 && (
              <thead>
                <tr>
                  {block.header.map((cell, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-2 py-1 bg-gray-100 text-left font-semibold text-gray-700"
                    >
                      {sanitizePreviewText(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border border-gray-200 px-2 py-1 text-gray-600"
                    >
                      {sanitizePreviewText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'image': {
      const displayUrl =
        block.url.length > 60 ? block.url.slice(0, 57) + '...' : block.url
      return (
        <div className="my-1 flex items-center gap-2 px-2 py-1.5 bg-gray-100 rounded text-xs text-gray-500">
          <span className="text-base leading-none">image</span>
          <span className="truncate">
            {block.alt || block.url ? `${block.alt || displayUrl}` : ''}
          </span>
        </div>
      )
    }

    case 'hr':
      return <hr className="my-2 border-gray-200" />

    default:
      return null
  }
}

export default function MarkdownPreview({ markdown }: Props) {
  const blocks = parseMarkdownPreview(markdown)

  if (blocks.length === 0) {
    return (
      <div className="text-xs text-gray-400 py-2 text-center">
        无内容可预览
      </div>
    )
  }

  return (
    <div className="text-left">
      {blocks.map((block, idx) => (
        <BlockRenderer key={idx} block={block} />
      ))}
    </div>
  )
}
