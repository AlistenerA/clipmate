import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../styles/globals.css'
import '../styles/popup.css'
import { shouldShowOnboarding } from '../onboarding/storage'

async function bootstrap() {
  if (await shouldShowOnboarding()) {
    window.location.replace(chrome.runtime.getURL('src/onboarding/index.html'))
    return
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

void bootstrap()
