import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/fmp': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist'
  }
})
