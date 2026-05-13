import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      build: {
        lib: {
          entry: resolve(import.meta.dirname, 'src/index.ts'),
          formats: ['es'],
          fileName: () => 'when.js',
        },
        outDir: 'dist',
        emptyOutDir: false,
        sourcemap: true,
      },
    };
  }

  // Demo mode: serve `demo/index.html` at the root.
  // `base` matches the GitHub Pages path (https://afstkla.github.io/when/).
  return {
    root: 'demo',
    base: mode === 'production' ? '/when/' : '/',
    server: { port: 5173, open: false },
    build: {
      outDir: '../dist-demo',
      emptyOutDir: true,
    },
  };
});
