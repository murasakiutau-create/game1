import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    __SAVE_KEY__: JSON.stringify(
      process.env.SAVE_KEY ?? 'mysterious-specimen-default-key-2026',
    ),
  },
});
