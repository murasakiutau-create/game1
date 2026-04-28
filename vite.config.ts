import { defineConfig, type Plugin } from 'vite';

// IIFEバンドル用に <script type="module" crossorigin> を素の <script> に書き換える
const stripModuleAttrs = (): Plugin => ({
  name: 'strip-module-attrs',
  enforce: 'post',
  transformIndexHtml(html) {
    return html
      .replace(/<script\s+type="module"\s+crossorigin\s+src="([^"]+)"><\/script>/g, '<script src="$1" defer></script>')
      .replace(/<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+)">/g, '<link rel="stylesheet" href="$1">');
  },
});

export default defineConfig({
  base: './',
  plugins: [stripModuleAttrs()],
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'game.js',
        assetFileNames: (info) =>
          info.name && info.name.endsWith('.css') ? 'game.css' : 'assets/[name][extname]',
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
  define: {
    __SAVE_KEY__: JSON.stringify(
      process.env.SAVE_KEY ?? 'mysterious-specimen-default-key-2026',
    ),
  },
});
