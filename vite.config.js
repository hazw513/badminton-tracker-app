import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/badminton-tracker-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
      manifest: {
        name: 'Badminton Tracker',
        short_name: 'Badminton',
        description: 'Track badminton sessions, gym workouts, diet and recovery.',
        start_url: '/badminton-tracker-app/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#dc2626',
        icons: [
          { src: '/badminton-tracker-app/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/badminton-tracker-app/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/badminton-tracker-app/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
})
