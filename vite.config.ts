import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { createAiHandler } from './server/ai-service.ts'

const aiMiddleware = () => {
  const handler = createAiHandler()
  return (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => {
    void handler(req, res).then(handled => { if (!handled) next() }).catch(() => {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end('{"error":"AI unavailable; use local guidance"}')
    })
  }
}

export default defineConfig({
  server: {
    hmr: false,
  },
  plugins: [
    react(),
    {
      name: 'benefits-optional-ai',
      configureServer(server) { server.middlewares.use(aiMiddleware()) },
      configurePreviewServer(server) { server.middlewares.use(aiMiddleware()) },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'pennybacker-photo-license.txt'],
      manifest: {
        name: 'Next Steps ATX: Austin Benefits Navigator',
        short_name: 'Next Steps ATX',
        description:
          'Find and apply for benefits you may qualify for in Austin & Travis County.',
        theme_color: '#286343',
        background_color: '#f8f6f1',
        display: 'standalone',
        start_url: '/',
        lang: 'en',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,json,geojson}', '**/*-latin-wght-normal-*.woff2'],
        // Tile fetches use the browser HTTP cache and the provider's expiry
        // headers. Do not cache opaque blocked/error images in the PWA.
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    pool: 'threads',
    maxWorkers: 1,
  },
})
