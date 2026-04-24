import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

// Copy static assets that aren't processed by Vite
function copyStatic() {
  return {
    name: 'copy-static',
    closeBundle() {
      const pairs = [
        ['dist', '_site/dist'],
        ['data', '_site/data'],
        ['llms.txt', '_site/llms.txt'],
        ['llms-dashboard.txt', '_site/llms-dashboard.txt'],
        ['llms-landing.txt', '_site/llms-landing.txt'],
      ];
      for (const [src, dest] of pairs) {
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true });
        }
      }
    },
  };
}

export default defineConfig({
  build: {
    outDir: '_site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        components: resolve(__dirname, 'components.html'),
        stack:      resolve(__dirname, 'stack.html'),
        acme:       resolve(__dirname, 'dashboard/acme.html'),
        sales:      resolve(__dirname, 'dashboard/sales.html'),
        startup:    resolve(__dirname, 'landing/startup.html'),
      },
    },
  },
  publicDir: false,
  plugins: [copyStatic()],
  server: {
    port: 3456,
    open: '/',
  },
});
