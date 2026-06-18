const LATEX_COMMAND_RE = /\\([a-zA-Z]+)(\{[^}]*\})*/g

const REPEATED_OP_RE = /(\S)\1{2,}/g

const INLINE_DOLLAR_RE = /\$[^$]+\$/g

const RENDERED_MAP: Record<string, string> = {
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
  '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
  '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
  '\\nu': 'ν', '\\xi': 'ξ', '\\omicron': 'ο', '\\pi': 'π',
  '\\rho': 'ρ', '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ',
  '\\phi': 'φ', '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
  '\\Alpha': 'Α', '\\Beta': 'Β', '\\Gamma': 'Γ', '\\Delta': 'Δ',
  '\\Epsilon': 'Ε', '\\Zeta': 'Ζ', '\\Eta': 'Η', '\\Theta': 'Θ',
  '\\Iota': 'Ι', '\\Kappa': 'Κ', '\\Lambda': 'Λ', '\\Mu': 'Μ',
  '\\Nu': 'Ν', '\\Xi': 'Ξ', '\\Omicron': 'Ο', '\\Pi': 'Π',
  '\\Rho': 'Ρ', '\\Sigma': 'Σ', '\\Tau': 'Τ', '\\Upsilon': 'Υ',
  '\\Phi': 'Φ', '\\Chi': 'Χ', '\\Psi': 'Ψ', '\\Omega': 'Ω',
  '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\div': '÷',
  '\\cdot': '·', '\\ast': '∗', '\\star': '⋆',
  '\\circ': '∘', '\\bullet': '•',
  '\\le': '≤', '\\ge': '≥', '\\ll': '≪', '\\gg': '≫',
  '\\neq': '≠', '\\equiv': '≡', '\\approx': '≈', '\\sim': '∼',
  '\\propto': '∝', '\\in': '∈', '\\ni': '∋', '\\subset': '⊂',
  '\\supset': '⊃', '\\subseteq': '⊆', '\\supseteq': '⊇',
  '\\cap': '∩', '\\cup': '∪', '\\wedge': '∧', '\\vee': '∨',
  '\\neg': '¬', '\\forall': '∀', '\\exists': '∃',
  '\\Rightarrow': '⇒', '\\Leftrightarrow': '⇔',
  '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇',
  '\\int': '∫', '\\sum': '∑', '\\prod': '∏',
  '\\sqrt': '√', '\\hat': '̂',
}

function collapseRepeatedOperators(text: string): string {
  return text.replace(REPEATED_OP_RE, (_match, char) => {
    if ('+=<>'.includes(char)) return char
    return _match
  })
}

function dedupRenderedWrap(text: string): string {
  const matches = text.match(LATEX_COMMAND_RE)
  if (!matches || matches.length === 0) return text

  let result = text
  for (const cmd of matches) {
    const baseCmd = cmd.replace(/\{.*/, '')
    const rendered = RENDERED_MAP[baseCmd]
    if (!rendered) continue

    const pattern = rendered + cmd + rendered
    if (result.includes(pattern)) {
      result = result.replace(pattern, rendered)
    }
  }

  return result
}

function dedupInlineFormulaWrap(text: string): string {
  const segments = text.match(INLINE_DOLLAR_RE)
  if (!segments || segments.length === 0) return text

  let result = text
  for (const seg of segments) {
    const inner = seg.slice(1, -1)
    const baseCmd = inner.replace(/\{.*/, '')
    const rendered = RENDERED_MAP[baseCmd]
    if (!rendered) continue

    const escaped = seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const leftPattern = new RegExp(rendered + escaped + rendered, 'g')
    if (leftPattern.test(result)) {
      result = result.replace(leftPattern, rendered)
    }
  }

  return result
}

export function normalizeFormulaTableCellText(text: string): string {
  if (!text) return text

  let result = text

  result = dedupRenderedWrap(result)
  result = dedupInlineFormulaWrap(result)
  result = collapseRepeatedOperators(result)

  return result
}
