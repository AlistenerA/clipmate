console.log('[ClipMate] background ready')

chrome.runtime.onMessage.addListener((message) => {
  console.log('[ClipMate] background received unhandled message:', message?.type)
  return false
})
