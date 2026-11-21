import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const manifestIcons = [
  { src: 'assets/icons/icon-48.webp', sizes: '48x48', type: 'image/webp', purpose: 'any maskable' },
  { src: 'assets/icons/icon-72.webp', sizes: '72x72', type: 'image/webp', purpose: 'any maskable' },
  { src: 'assets/icons/icon-96.webp', sizes: '96x96', type: 'image/webp', purpose: 'any maskable' },
  { src: 'assets/icons/icon-128.webp', sizes: '128x128', type: 'image/webp', purpose: 'any maskable' },
  { src: 'assets/icons/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any maskable' },
  { src: 'assets/icons/icon-256.webp', sizes: '256x256', type: 'image/webp', purpose: 'any maskable' },
  { src: 'assets/icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any maskable' }
]

const pwaOptions = {
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,webp,jpg,jpeg,svg}'],
    maximumFileSizeToCacheInBytes: 3000000,
  },
  includeManifestIconsInDownloadUrls: false,
  manifest: {
    name: 'J. RIBEIRO SERVIÇOS E.I',
    short_name: 'JuDelivery',
    description: 'Delivery and service platform',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    display_override: ['window-controls-overlay'],
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    prefer_related_applications: false,
    icons: manifestIcons,
    shortcuts: [
      {
        name: 'Pedidos',
        short_name: 'Pedidos',
        description: 'Ver pedidos',
        url: '/orders',
        icons: [{ src: 'assets/icons/icon-96.webp', sizes: '96x96' }]
      },
      {
        name: 'Perfil',
        short_name: 'Perfil',
        description: 'Ver perfil',
        url: '/profile',
        icons: [{ src: 'assets/icons/icon-96.webp', sizes: '96x96' }]
      }
    ]
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],
})
