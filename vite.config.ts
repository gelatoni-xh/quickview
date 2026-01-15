import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { SocksProxyAgent } from 'socks-proxy-agent'
import type { ConfigEnv } from 'vite'

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '')

  const agent = env.VITE_USE_PROXY === 'true'
      ? new SocksProxyAgent(env.VITE_PROXY_URL)
      : undefined

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          agent
        }
      }
    }
  })
}
