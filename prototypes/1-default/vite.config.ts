import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' + hash routing lets the build be served from any sub-path (/1/, /2/, /3/).
// Images and data come from ../shared so all three prototypes use the same content.
export default defineConfig({
  base: './',
  publicDir: '../shared/public',
  plugins: [react()],
  resolve: { alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) } },
  server: { fs: { allow: ['..'] } },
})
