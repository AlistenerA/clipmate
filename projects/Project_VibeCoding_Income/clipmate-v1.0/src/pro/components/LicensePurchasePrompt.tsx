// Version: v1.0.1
import { PURCHASE_NOTICE, PURCHASE_URL } from '../config'

interface LicensePurchasePromptProps {
  buttonLabel: string
}

export default function LicensePurchasePrompt({ buttonLabel }: LicensePurchasePromptProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded border border-amber-100 bg-amber-50 p-3">
      <p className="text-xs leading-5 text-amber-800">{PURCHASE_NOTICE}</p>
      <button
        type="button"
        className="rounded bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
        onClick={() => void chrome.tabs.create({ url: PURCHASE_URL })}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
