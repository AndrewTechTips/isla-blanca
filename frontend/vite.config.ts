import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin API calls in development: no CORS, no hard-coded backend URL.
    proxy: { '/api': 'http://localhost:8000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
  build: {
    // The 360° viewer (three.js, ~630 kB) is the only chunk above Vite's 500 kB default. It is
    // downloaded only when a visitor starts a room tour, never on page load.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // Libraries change rarely: keep them in their own files so browsers cache them
        // across deploys of the app code.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            {
              name: 'motion',
              test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/,
            },
            {
              name: 'panorama',
              test: /node_modules[\\/](@photo-sphere-viewer|three)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
