import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    rollupOptions: {
      external: ['mongodb'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['axios'],
    exclude: ['mongodb']
  }
})