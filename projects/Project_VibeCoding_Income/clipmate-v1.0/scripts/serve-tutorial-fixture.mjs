import { createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'manual-fixtures')
const fixture = join(root, 'tutorial-mode.html')
const port = 4174

const server = createServer((request, response) => {
  const path = new URL(request.url || '/', `http://127.0.0.1:${port}`).pathname
  if (path !== '/' && path !== '/tutorial-mode.html') {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  createReadStream(fixture).pipe(response)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`ClipMate tutorial QA fixture: http://127.0.0.1:${port}/tutorial-mode.html`)
})
