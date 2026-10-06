import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Cloudflare plugin runs worker/index.ts in the Workers runtime during `vite dev`,
// with a local D1 database, so /api/* behaves the same as in production.
export default defineConfig({
  plugins: [react(), cloudflare()],
})
