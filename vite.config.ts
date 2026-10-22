import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { watch: { ignored: ['**/test-results/**', '**/playwright-report/**', '**/audit-results/**', '**/references/**', '**/Frontend Challenge/**', '**/tests/**'] } },
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  build: { target: 'es2022' },
})
