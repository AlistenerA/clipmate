import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LicensePurchasePrompt from '../src/pro/components/LicensePurchasePrompt'
import { PURCHASE_NOTICE } from '../src/pro/config'

describe('v1.0.1 License purchase prompt', () => {
  it('shows the temporary website notice and upgrade action', () => {
    const html = renderToStaticMarkup(
      <LicensePurchasePrompt buttonLabel="查看升级方案" />
    )

    expect(html).toContain(PURCHASE_NOTICE)
    expect(html).toContain('查看升级方案')
  })
})
