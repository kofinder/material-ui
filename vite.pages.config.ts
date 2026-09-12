import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./pages', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  base: process.env.PAGES_BASE_PATH || '/material-ui/',
  plugins: [react()],
  // Use the existing Tailwind/PostCSS configuration at the project root.
  css: { postcss: fileURLToPath(new URL('.', import.meta.url)) },
  build: {
    outDir: fileURLToPath(new URL('./dist-pages', import.meta.url)),
    emptyOutDir: true,
  },
});
