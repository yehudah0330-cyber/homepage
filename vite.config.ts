import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '신영통부부한의원',
        short_name: '신영통부부한의원',
        description: '전화 없이 예약하고 진료 정보를 확인하세요',
        lang: 'ko',
        start_url: '/app',
        display: 'standalone',
        background_color: '#f4ede2',
        theme_color: '#7a5c46',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: { navigateFallback: '/index.html' }
    })
  ]
})
