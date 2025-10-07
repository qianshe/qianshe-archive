import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dashboard-worker/dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600, // 调整警告阈值到600KB
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          // React生态系统
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 查询和状态管理
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          // UI组件库
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hot-toast'],
          // 表单和工具
          'utils-vendor': ['react-hook-form', 'axios', 'date-fns'],
          // 图表库
          'charts-vendor': ['recharts']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  },
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared')
    }
  }
});
