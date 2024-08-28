// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Polyfills
import process from 'process';
import { Buffer } from 'buffer';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Polyfill for process
      process: 'process/browser',
      // Polyfill for Buffer
      buffer: 'buffer',
    },
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {
      output: {
        format: 'umd',
        name: 'Apify',
      },
    },
  },
});
