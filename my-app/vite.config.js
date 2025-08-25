// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Load target from .env if provided, fallback to localhost:4000
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:4000'

  return {
    plugins: [react()],
    server: {
      port: 5173, // adjust if needed
      proxy: {
        // All requests starting with /api will be proxied to your backend
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // If your backend DOES NOT include the /api prefix, uncomment this:
          // rewrite: (path) => path.replace(/^\/api/, ''),
          // If your backend is HTTPS with self-signed cert, uncomment:
          // secure: false,
        },
      },
    },
    // Optional: if deploying under a subpath in dev, set base here
    // base: '/',
  }
})
