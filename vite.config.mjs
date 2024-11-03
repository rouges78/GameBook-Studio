import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils')
    },
  },
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    open: false
  },
  clearScreen: false,
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      '@headlessui/react',
      '@heroicons/react',
      'lucide-react'
    ]
  }
});
