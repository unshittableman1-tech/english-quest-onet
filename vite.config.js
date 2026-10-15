import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Force immediate activation of new service worker (no waiting for tab close)
      injectRegister: 'auto',
      workbox: {
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
  server: {
    port: 5173,
    open: true
  }
})
