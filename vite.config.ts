import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    ...(isSsrBuild ? [] : [VitePWA({
      registerType: 'autoUpdate',
      // 아이콘은 아래 globPatterns 가 저장하므로 목록에 겹쳐 넣지 않습니다.
      includeManifestIcons: false,
      manifest: {
        name: '신영통부부한의원',
        short_name: '신영통부부한의원',
        description: '진료시간, 진료 안내, 오시는 길을 바로 확인하세요',
        id: '/app',
        scope: '/',
        lang: 'ko',
        start_url: '/app',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0d1630',
        theme_color: '#0d1630',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: '진료 예약', url: '/reserve' },
          { name: '오시는 길', url: '/directions' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        // 서버가 만드는 화면과 검색용 파일은 저장해 둔 화면으로 바꿔치기하지 않습니다
        navigateFallbackDenylist: [/^\/api\//, /^\/column/, /\.(xml|txt|png|jpg)$/],
        globPatterns: ['**/*.{js,css,html,svg,png,jpg}']
      }
    })])
  ]
}))
