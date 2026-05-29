import { defineConfig } from 'vite';

// Static build: hashed assets in dist/, served by nginx in production.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    host: true,
    port: 5173,
  },
});
