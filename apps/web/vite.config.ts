import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_URL ?? '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@focal/logic': path.resolve(__dirname, '../../packages/logic/src'),
      '@focal/persistence-web': path.resolve(__dirname, '../../packages/persistence-web/src'),
    },
  },
  css: {
    modules: { localsConvention: 'camelCase' },
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src/styles')],
        additionalData: `@import 'variables'; @import 'mixins';`,
      },
    },
  },
})
