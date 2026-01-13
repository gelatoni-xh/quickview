import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  // Chrome extension 里需要相对路径
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'https://worldtimeapi.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
