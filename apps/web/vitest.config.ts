import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: [
      'src/**/*.test.{ts,tsx}',
      '../../packages/**/*.test.{ts,tsx}',
    ],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@focal/logic': path.resolve(__dirname, '../../packages/logic/src'),
      '@focal/persistence-web': path.resolve(__dirname, '../../packages/persistence-web/src'),
    },
  },
})
