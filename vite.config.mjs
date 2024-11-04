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
    port: parseInt(process.env.VITE_PORT) || 5173, // Usa la variabile d'ambiente
    strictPort: false, // Consenti di cambiare porta se già occupata
    open: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: parseInt(process.env.VITE_PORT) || 5173
    }
  },
  preview: {
    port: parseInt(process.env.VITE_PORT) || 5173,
    strictPort: false,
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
