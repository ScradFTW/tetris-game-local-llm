import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig as defineVitestConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: defineVitestConfig({
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['playwright/**/*'],
  }),
})
