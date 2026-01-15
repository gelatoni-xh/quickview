import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { HttpProxyAgent } from 'http-proxy-agent'

const agent = new HttpProxyAgent('http://127.0.0.1:10090')

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://3.112.249.180:8080',
        changeOrigin: true,
        agent
      }
    }
  }
})
