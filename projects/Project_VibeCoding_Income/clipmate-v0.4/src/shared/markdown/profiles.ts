import type { MarkdownTarget, MarkdownProfile } from '../types/clip.types'

const ALL_TARGETS: readonly MarkdownTarget[] = ['notion', 'obsidian', 'typora', 'generic']

const PROFILES: Record<MarkdownTarget, MarkdownProfile> = {
  notion: {
    target: 'notion',
    label: 'Notion',
    description: '适合粘贴/保存到 Notion',
    frontmatter: false,
    tagStyle: 'hashtag',
    sourceStyle: 'plain-label',
    headingStyle: 'standard',
    imageStyle: 'standard',
    tableStyle: 'standard',
    formulaStyle: 'preserve-text',
    codeBlockStyle: 'standard',
  },
  obsidian: {
    target: 'obsidian',
    label: 'Obsidian',
    description: 'YAML frontmatter + 标签',
    frontmatter: true,
    tagStyle: 'yaml',
    sourceStyle: 'frontmatter',
    headingStyle: 'standard',
    imageStyle: 'preserve',
    tableStyle: 'standard',
    formulaStyle: 'preserve-text',
    codeBlockStyle: 'preserve-language',
  },
  typora: {
    target: 'typora',
    label: 'Typora',
    description: '标准 Markdown，适合 Typora / VS Code',
    frontmatter: false,
    tagStyle: 'hashtag',
    sourceStyle: 'markdown-link',
    headingStyle: 'standard',
    imageStyle: 'preserve',
    tableStyle: 'standard',
    formulaStyle: 'preserve-text',
    codeBlockStyle: 'preserve-language',
  },
  generic: {
    target: 'generic',
    label: '通用 Markdown',
    description: '最通用、最少特定语法',
    frontmatter: false,
    tagStyle: 'hashtag',
    sourceStyle: 'plain-label',
    headingStyle: 'standard',
    imageStyle: 'standard',
    tableStyle: 'standard',
    formulaStyle: 'preserve-text',
    codeBlockStyle: 'standard',
  },
}

export function getMarkdownProfile(target: MarkdownTarget): MarkdownProfile {
  return PROFILES[target]
}

export function listMarkdownProfiles(): MarkdownProfile[] {
  return ALL_TARGETS.map((t) => PROFILES[t])
}

export function normalizeMarkdownTarget(value: string | undefined | null): MarkdownTarget {
  if (value && (ALL_TARGETS as readonly string[]).includes(value)) {
    return value as MarkdownTarget
  }
  return 'notion'
}

export { ALL_TARGETS }
