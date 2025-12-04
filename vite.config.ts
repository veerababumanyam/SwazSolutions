import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: false,
      proxy: {
        '/covers': {
          target: 'http://localhost:3000',
          changeOrigin: true
        },
        '/music': {
          target: 'http://localhost:3000',
          changeOrigin: true
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173
      }
    },
    plugins: [react()],
    css: {
      postcss: './postcss.config.cjs',
    },
    define: {
      // DO NOT expose API keys in client bundle
      // API keys should be stored client-side only in localStorage
      // and should ideally be proxied through backend
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3000'),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
