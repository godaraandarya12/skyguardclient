import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: isDev
      ? {
          hmr: {
            protocol: 'ws',
            host: 'localhost'
          }
        }
      : undefined,
    build: {
      sourcemap: false, // Optional: removes dev traces
    }
  }
})
