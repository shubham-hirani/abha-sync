import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/aws-places': {
        target: 'https://places.geo.us-east-1.amazonaws.com', // Will be customized per-region if needed
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aws-places/, ''),
      },
    },
  },
})