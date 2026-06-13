import { describe, it, expect } from 'vitest'
import { normalizeFormulaTableCellText } from '../src/shared/markdown/formulaTableNormalizer'

describe('normalizeFormulaTableCellText', () => {
  describe('dedup rendered + latex + rendered patterns', () => {
    it('normalizes α\\alphaα to α', () => {
      expect(normalizeFormulaTableCellText('α\\alphaα')).toBe('α')
    })

    it('normalizes Σ\\SigmaΣ to Σ', () => {
      expect(normalizeFormulaTableCellText('Σ\\SigmaΣ')).toBe('Σ')
    })

    it('normalizes β\\betaβ to β', () => {
      expect(normalizeFormulaTableCellText('β\\betaβ')).toBe('β')
    })

    it('normalizes γ\\gammaγ to γ', () => {
      expect(normalizeFormulaTableCellText('γ\\gammaγ')).toBe('γ')
    })

    it('normalizes δ\\deltaδ to δ', () => {
      expect(normalizeFormulaTableCellText('δ\\deltaδ')).toBe('δ')
    })

    it('normalizes λ\\lambdaλ to λ', () => {
      expect(normalizeFormulaTableCellText('λ\\lambdaλ')).toBe('λ')
    })

    it('normalizes π\\piπ to π', () => {
      expect(normalizeFormulaTableCellText('π\\piπ')).toBe('π')
    })

    it('does not affect non-repeated LaTeX', () => {
      const input = '\\alpha \\beta \\gamma'
      expect(normalizeFormulaTableCellText(input)).toBe(input)
    })

    it('does not affect text without LaTeX', () => {
      expect(normalizeFormulaTableCellText('hello world')).toBe('hello world')
    })

    it('handles empty string', () => {
      expect(normalizeFormulaTableCellText('')).toBe('')
    })
  })

  describe('operator symbol repetition compression', () => {
    it('compresses +++ to +', () => {
      expect(normalizeFormulaTableCellText('+++')).toBe('+')
    })

    it('compresses <<< to <', () => {
      expect(normalizeFormulaTableCellText('<<<')).toBe('<')
    })

    it('compresses >>> to >', () => {
      expect(normalizeFormulaTableCellText('>>>')).toBe('>')
    })

    it('compresses === to =', () => {
      expect(normalizeFormulaTableCellText('===')).toBe('=')
    })

    it('does not compress ++ (two chars)', () => {
      expect(normalizeFormulaTableCellText('++')).toBe('++')
    })

    it('does not compress == (two chars)', () => {
      expect(normalizeFormulaTableCellText('==')).toBe('==')
    })
  })

  describe('combined patterns', () => {
    it('handles rendered+latex+rendered with operator', () => {
      expect(normalizeFormulaTableCellText('α\\alphaα +++')).toBe('α +')
    })

    it('does not affect code block content', () => {
      const code = 'x += 1'
      expect(normalizeFormulaTableCellText(code)).toBe(code)
    })

    it('preserves sqrt with rendered', () => {
      expect(normalizeFormulaTableCellText('√\\sqrt{x}√')).toBe('√')
    })

    it('does not dedup when rendered chars differ from surrounding text', () => {
      expect(normalizeFormulaTableCellText('x\\sqrt{x}x')).toBe('x\\sqrt{x}x')
    })
  })

  describe('LaTeX command in cell with rendered symbols', () => {
    it('keeps LaTeX command when not surrounded by rendered chars', () => {
      expect(normalizeFormulaTableCellText('\\alpha')).toBe('\\alpha')
    })

    it('keeps rendered symbol when no LaTeX present', () => {
      expect(normalizeFormulaTableCellText('α')).toBe('α')
    })
  })

  describe('inline formula dedup ($\\alpha$ patterns)', () => {
    it('normalizes α$\\alpha$α to α', () => {
      expect(normalizeFormulaTableCellText('α$\\alpha$α')).toBe('α')
    })

    it('normalizes Σ$\\Sigma$Σ to Σ', () => {
      expect(normalizeFormulaTableCellText('Σ$\\Sigma$Σ')).toBe('Σ')
    })

    it('normalizes β$\\beta$β to β', () => {
      expect(normalizeFormulaTableCellText('β$\\beta$β')).toBe('β')
    })

    it('normalizes $$$\\alpha$$$ in cell', () => {
      expect(normalizeFormulaTableCellText('α$\\alpha$α')).toBe('α')
    })

    it('does not dedup when $ signs are for different content', () => {
      const input = 'price is $10$ and $20$'
      expect(normalizeFormulaTableCellText(input)).toBe(input)
    })
  })
})
