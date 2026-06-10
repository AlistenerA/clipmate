export default function App() {
  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="w-80 p-4">
      <h1 className="text-lg font-bold mb-2">ClipMate v0.1</h1>
      <p className="text-sm text-gray-500 mb-4">当前为开发预览版本</p>
      <button
        onClick={openOptions}
        className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        打开设置
      </button>
    </div>
  )
}
