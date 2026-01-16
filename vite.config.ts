import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { SocksProxyAgent } from 'socks-proxy-agent'
import type { ConfigEnv } from 'vite'

export default ({ mode, command }: ConfigEnv) => {
    const env = loadEnv(mode, process.cwd(), '')
    const isDev = command === 'serve'

    return defineConfig({
        plugins: [react()],

        server: isDev
            ? {
                proxy: {
                    '/api': {
                        target: env.VITE_API_BASE_URL,
                        changeOrigin: true,
                        agent:
                            env.VITE_USE_PROXY === 'true'
                                ? new SocksProxyAgent(env.VITE_PROXY_URL)
                                : undefined
                    }
                }
            }
            : undefined
    })
}
