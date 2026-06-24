import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'SOL SOL 달러',
        short_name: 'SOL SOL',
        description: '신한 그룹 연계 해외 공모주 IPO 청약 앱',
        theme_color: '#1C1FE8',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/ipos/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'ipo-cache', expiration: { maxAgeSeconds: 60 * 60 } },
          },
          {
            urlPattern: /\/api\/(subscriptions|accounts)/,
            handler: 'NetworkFirst',
            options: { cacheName: 'ledger-cache' },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/service': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/service/, ''),
      },
      '/api/ledger': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ledger/, ''),
      },
      '/api/v1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
