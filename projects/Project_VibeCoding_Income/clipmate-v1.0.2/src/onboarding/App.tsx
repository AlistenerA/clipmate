// Version: v1.0.1
import { useMemo, useState } from 'react'
import { NOTION_INTEGRATION_URL } from '../pro/config'
import { completeOnboarding } from './storage'

const STEPS = [
  {
    title: '快速剪藏网页',
    description: '打开任意网页后点击 ClipMate，选择全文、选区或自适应模式，再保存到 Notion 或复制 Markdown。',
    badge: '基础功能'
  },
  {
    title: '按需升级 Pro',
    description: '批量保存与 AI 摘要将作为 Pro 功能提供。现有全文、选区、教程、图片选择和 Notion 保存继续免费。',
    badge: 'Pro 预告'
  },
  {
    title: '连接你的 Notion',
    description: '创建 Notion Integration，将目标页面共享给它，再到 ClipMate 设置页填写 Token 和页面信息。',
    badge: '授权引导'
  }
] as const

export default function App() {
  const [step, setStep] = useState(0)
  const current = useMemo(() => STEPS[step], [step])
  const isLast = step === STEPS.length - 1

  const finish = async () => {
    await completeOnboarding()
    window.location.replace(chrome.runtime.getURL('src/popup/index.html'))
  }

  return (
    <main className="onboarding-shell">
      <header>
        <p className="eyebrow">CLIPMATE 1.0</p>
        <h1>欢迎使用 ClipMate</h1>
        <p className="subtitle">三步完成首次设置</p>
      </header>

      <div className="step-dots" aria-label={`第 ${step + 1} 步，共 ${STEPS.length} 步`}>
        {STEPS.map((item, index) => (
          <span key={item.title} className={index === step ? 'active' : ''} />
        ))}
      </div>

      <section className="step-card">
        <span className="badge">{current.badge}</span>
        <p className="step-number">0{step + 1}</p>
        <h2>{current.title}</h2>
        <p>{current.description}</p>
        {step === 1 && (
          <ul>
            <li>批量保存：一次处理多个页面</li>
            <li>AI 摘要：生成更紧凑的内容摘要</li>
          </ul>
        )}
        {isLast && (
          <button
            type="button"
            className="notion-button"
            onClick={() => void chrome.tabs.create({ url: NOTION_INTEGRATION_URL })}
          >
            打开 Notion Integration 页面
          </button>
        )}
      </section>

      <footer>
        <button
          type="button"
          className="secondary-button"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          上一步
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => (isLast ? void finish() : setStep((value) => value + 1))}
        >
          {isLast ? '开始使用' : '下一步'}
        </button>
      </footer>
    </main>
  )
}
