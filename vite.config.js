import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app1: path.resolve(__dirname, 'app1/src/index.html'),
        app2: path.resolve(__dirname, 'app2/src/index.html'),
      }
    }
  },
  server: {
    root: '.', 
    open: '/src/app1/index.html',
    fs: {
      strict: false, // サブフォルダの index.html を許可
    }
  }
})
