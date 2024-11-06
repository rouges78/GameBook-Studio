import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      // Add browser-compatible Node.js modules
      path: 'path-browserify',
      fs: 'browserify-fs',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      os: 'os-browserify/browser'
    }
  },
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        'electron',
        'electron-updater'
      ]
    }
  },
  server: {
    port: parseInt(process.env.VITE_PORT) || 5173,
    strictPort: false,
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
      'lucide-react',
      // Add browser-compatible Node.js modules
      'path-browserify',
      'browserify-fs',
      'crypto-browserify',
      'stream-browserify',
      'util',
      'os-browserify/browser'
    ],
    exclude: [
      'electron',
      'electron-updater'
    ]
  },
  // Handle Node.js built-in modules
  define: {
    '__dirname': 'undefined',
    '__filename': 'undefined',
    'process.env': '{}'
  },
  worker: {
    format: 'es',
    plugins: () => [], // Convert plugins to a function that returns an array
    rollupOptions: {
      output: {
        format: 'es',
        sourcemap: true
      }
    }
  }
});
