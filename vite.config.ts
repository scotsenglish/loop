import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const rootDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname)

// https://vite.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/apple-touch-icon.png'],
      manifest: {
        id: './',
        lang: 'vi',
        name: 'Loop – Nhật ký chi tiêu',
        short_name: 'Loop',
        description: 'Ghi chép và theo dõi chi tiêu hằng ngày một cách nhẹ nhàng, trực quan.',
        theme_color: '#6366F1',
        background_color: '#0B0E14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js$/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    // Note: dist/ isn't force-cleaned between builds in some sandboxed CI
    // filesystems; Vite still overwrites content-hashed files correctly.
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('recharts')) return 'charts'
            if (id.includes('react')) return 'vendor'
          }
        },
      },
    },
  },
})
