import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/card-game-companion/', // 👈 MUST match your GitHub repo name

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Gwent Companion App',
        short_name: 'Gwent Companion',
        description: 'Gwent Companion App',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/card-game-companion/',
        scope: '/card-game-companion/',
        icons: [
          {
            src: '/card-game-companion/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/card-game-companion/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}']
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})