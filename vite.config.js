import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { labelingLabPreview } from './dev/labelingLabServer.mjs'
import { graphComparisonPreview } from './dev/graphComparisonServer.mjs'
import { topThirtyLocalPractice } from './dev/topThirtyServer.mjs'
import { onet2569PrivateReview } from './dev/onet2569ReviewServer.mjs'
import { yearSimulationReview } from './dev/yearSimulationServer.mjs'

const localhostServiceWorkerReset = () => ({
  name: 'localhost-service-worker-reset',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (request.url?.split('?')[0] !== '/sw.js') {
        next()
        return
      }

      response.statusCode = 200
      response.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.end(`
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((windowClient) => windowClient.navigate(windowClient.url));
  })());
});
`)
    })
  },
})

export default defineConfig({
  cacheDir: 'node_modules/.vite-onet3-main',
  optimizeDeps: { include: ['read-excel-file/browser'] },
  plugins: [
    react(),
    onet2569PrivateReview(),
    yearSimulationReview(),
    topThirtyLocalPractice(),
    localhostServiceWorkerReset(),
    labelingLabPreview(),
    graphComparisonPreview(),
    VitePWA({
      registerType: 'autoUpdate',
      // Force immediate activation of new service worker (no waiting for tab close)
      injectRegister: 'auto',
      devOptions: {
        enabled: false
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // Allow the current app shell to be precached.
        skipWaiting: true,        // Take control immediately when new SW is installed
        clientsClaim: true,       // Claim all existing clients immediately
        cleanupOutdatedCaches: true, // Remove old caches automatically
        // Network-first for JS/CSS so updates apply immediately
        runtimeCaching: []        // Disable runtime caching for app shell
      },
      manifest: {
        name: 'O-NET Adventure',
        short_name: 'O-NET Adv',
        description: 'English Quest AI: O-NET Adventure สำหรับนักเรียนประถม 6',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  },
  server: {
    host: true,
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/dev/private/**', '**/output/pdf/onet-simulation-review/**', '**/docs/onet-2569/**', '**/englishP6.pdf', '**/ข้อสอบ/**', '**/scratch/onet-year-source/**', '**/docs/question-understanding-top30*/**', '**/scripts/**', '**/tests/**', '**/backups/**'] },
    port: 5173,
    open: false,
    headers: {
      'Cache-Control': 'no-store'
    }
  }
})

