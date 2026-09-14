import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Static design-system showcase — a second Vite entry so it loads
        // the app's real index.css (same hashed asset, single source of
        // truth) instead of a hand-duplicated copy of the tokens.
        designSystem: resolve(__dirname, 'design-system.html'),
      },
    },
  },
});
