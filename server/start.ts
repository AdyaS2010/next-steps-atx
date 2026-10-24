import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { createAiHandler } from './ai-service.ts'

const root = resolve('dist')
const port = Number(process.env.PORT ?? 4173)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port')
await stat(resolve(root, 'index.html'))
const handleAi = createAiHandler()
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
  '.jpg': 'image/jpeg', '.txt': 'text/plain; charset=utf-8',
}
const server = createServer(async (request, response) => {
  if (await handleAi(request, response)) return
  if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405); response.end(); return }
  let pathname: string
  try { pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname) }
  catch { response.writeHead(400); response.end(); return }
  const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`)
  if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return }
  try {
    const data = await readFile(file)
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': file.includes(`${sep}assets${sep}`) ? 'public,max-age=31536000,immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    })
    response.end(request.method === 'HEAD' ? undefined : data)
  } catch (error) {
    const notFound = error instanceof Error && 'code' in error && ['ENOENT', 'EISDIR'].includes(String(error.code))
    response.writeHead(notFound ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(notFound ? 'Not found' : 'Unable to load the application')
  }
})
server.requestTimeout = 10000
server.headersTimeout = 10000
server.listen(port, '127.0.0.1', () => console.log(`Next Steps ATX: http://127.0.0.1:${port}`))
