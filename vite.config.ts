import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  base: '/fishing-weather-app/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'owm-api-cache',
              expiration: { maxAgeSeconds: 600 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/.*\.meteofrance\.fr\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mf-api-cache',
              expiration: { maxAgeSeconds: 600 },
              networkTimeoutSeconds: 15,
            },
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openmeteo-api-cache',
              expiration: { maxAgeSeconds: 600 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/marine-api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openmeteo-marine-cache',
              expiration: { maxAgeSeconds: 600 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/hubeau\.eaufrance\.fr\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vigicrues-cache',
              expiration: { maxAgeSeconds: 900 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/services\.data\.shom\.fr\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'shom-tiles-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/(a|b|c)\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/tiles\.openseamap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'openseamap-tiles-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'FishWeather - Météo Pêche & Navigation',
        short_name: 'FishWeather',
        description: 'Météo marine, cartographie, marées et conditions de pêche',
        theme_color: '#0f4c81',
        background_color: '#f0f9ff',
        display: 'standalone',
        orientation: 'any',
        scope: '/fishing-weather-app/',
        start_url: '/fishing-weather-app/',
        categories: ['weather', 'sports', 'navigation'],
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-map': ['leaflet', 'react-leaflet', 'maplibre-gl'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-utils': ['zustand', 'date-fns', 'suncalc', 'idb', 'zod'],
        },
      },
    },
  },
})
