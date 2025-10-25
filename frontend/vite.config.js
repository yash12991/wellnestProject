/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }) => {
  // load .env files for the current mode (development/production)
  // avoid direct `process` usage so this file lints cleanly in the workspace
  const rootDir = new URL('.', import.meta.url).pathname
  const env = loadEnv(mode, rootDir, '')
  const VITE_API_URL = env.VITE_API_URL || 'http://localhost:5000'

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/v1/api': {
          target: VITE_API_URL,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      // make sure import.meta.env.VITE_API_URL is available in client code
      'process.env': {},
    }
  })
}
