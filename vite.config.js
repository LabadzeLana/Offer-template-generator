import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = p => fileURLToPath(new URL(p, import.meta.url))

// The Vite source entry lives in src/index.html. The build produces ONE
// self-contained HTML file (JS, CSS and logo inlined) and copies it to the
// project root as index.html, so double-clicking index.html just works.
export default defineConfig({
  root: here('./src'),
  publicDir: here('./public'),
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    {
      name: 'copy-standalone-to-root',
      closeBundle() { copyFileSync(here('./dist/index.html'), here('./index.html')) },
    },
  ],
  build: {
    outDir: here('./dist'),
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 5000,
  },
})
