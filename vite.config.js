import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',        // ✅ ensures build output is in dist/
    sourcemap: false       // optional: keeps build small and fast
  },
  server: {
    port: 5173             // optional: dev server port
  }
})

