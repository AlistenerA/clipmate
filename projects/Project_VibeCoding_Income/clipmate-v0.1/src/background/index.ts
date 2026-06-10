console.log('[ClipMate] background ready')

chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  sendResponse({ success: true })
  return true
})
