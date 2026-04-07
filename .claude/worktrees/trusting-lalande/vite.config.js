import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/img-proxy/m2img': {
        target: 'https://m2img.lxzin.com',
        changeOrigin: true,
        rewrite: (path) => path.replace('/img-proxy/m2img', ''),
        headers: {
          'Referer': 'https://www.lxzin.com/',
        }
      },
      '/img-proxy/octapi': {
        target: 'https://octapi.lxzin.com',
        changeOrigin: true,
        rewrite: (path) => path.replace('/img-proxy/octapi', ''),
        headers: {
          'Referer': 'https://www.lxzin.com/',
        }
      }
    }
  }
})
