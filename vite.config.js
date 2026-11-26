import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const manifestIcons = [
  { src: 'assets/icons/icon-48.png', sizes: '48x48', type: 'image/png', purpose: 'any maskable' },
  { src: 'assets/icons/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
  { src: 'assets/icons/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any maskable' },
  { src: 'assets/icons/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
  { src: 'assets/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
  { src: 'assets/icons/icon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any maskable' },
  { src: 'assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
];


const pwaOptions = {
  registerType: 'autoUpdate',
  devOptions: {
    enabled: true,
    type: 'module',
  },
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
        name: 'Participantes',
        short_name: 'Participantes',
        description: 'Ver participantes do evento',
        url: '/app/mentee/participantes',
        icons: [{ src: 'assets/icons/icon-96.png', sizes: '96x96' }]
      },
      {
        name: 'Perfil',
        short_name: 'Perfil',
        description: 'Ver o meu perfil',
        url: '/app/mentee/profile',
        icons: [{ src: 'assets/icons/icon-96.png', sizes: '96x96' }]
      }
    ]
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],
})
