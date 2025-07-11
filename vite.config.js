import { defineConfig } from 'vite'
//import path from 'path'

export default defineConfig(({ mode }) => {
  console.log('VITE MODE:', mode);
  return   {
    base: mode === 'production' ? '/raindrop/' : '/',
    root: 'src',
    publicDir: '../public',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
  };
});
