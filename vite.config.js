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
    name: 'Career Connect',
    short_name: 'CareerConnect',
    description: 'Plataforma de mentoria e networking profissional',
    theme_color: '#1b2a57',
    background_color: '#1b2a57',
    display: 'standalone',
    display_override: ['window-controls-overlay'],
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    lang: 'pt-PT',
    prefer_related_applications: false,
    icons: manifestIcons,
    shortcuts: [
      {
        name: 'Mentores',
        short_name: 'Mentores',
        description: 'Ver mentores disponíveis',
        url: '/app/mentee/mentors',
        icons: [{ src: 'assets/icons/icon-96.webp', sizes: '96x96' }]
      },
      {
        name: 'Perfil',
        short_name: 'Perfil',
        description: 'Ver o meu perfil',
        url: '/app/mentee/profile',
        icons: [{ src: 'assets/icons/icon-96.webp', sizes: '96x96' }]
      }
    ]
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],
})
