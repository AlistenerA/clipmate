import { createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'manual-fixtures')
const fixture = join(root, 'asset-picker.html')
const port = 4175

function fixtureImage(label, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <rect width="960" height="540" fill="${color}"/>
    <circle cx="170" cy="170" r="92" fill="rgba(255,255,255,.22)"/>
    <path d="M0 470 260 250l170 150 150-110 380 250H0Z" fill="rgba(15,23,42,.25)"/>
    <text x="480" y="285" text-anchor="middle" font-family="system-ui,sans-serif" font-size="48" fill="white">${label}</text>
  </svg>`
}

const images = new Map([
  ['/images/figure.svg', fixtureImage('Figure image', '#2563eb')],
  ['/images/lazy.svg', fixtureImage('Lazy image', '#7c3aed')],
  ['/images/picture.svg', fixtureImage('Picture source', '#0f766e')],
  ['/images/extra.svg', fixtureImage('Extra image', '#c2410c')],
  ['/images/hidden.svg', fixtureImage('Hidden image', '#475569')],
  ['/images/avatar.svg', fixtureImage('Avatar noise', '#be123c')]
])

const server = createServer((request, response) => {
  const path = new URL(request.url || '/', `http://127.0.0.1:${port}`).pathname
  if (path === '/' || path === '/asset-picker.html') {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
    createReadStream(fixture).pipe(response)
    return
  }

  const image = images.get(path)
  if (image) {
    response.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store'
    })
    response.end(image)
    return
  }

  if (path === '/tracking/pixel.gif') {
    response.writeHead(200, { 'Content-Type': 'image/gif' })
    response.end(Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64'))
    return
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('Not found')
})

server.listen(port, '127.0.0.1', () => {
  console.log(`ClipMate Asset Picker QA fixture: http://127.0.0.1:${port}/asset-picker.html`)
})
