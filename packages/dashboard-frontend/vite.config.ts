import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@shared': resolve(__dirname, '../shared')
    }
  },
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8788', // Dashboard Worker dev server
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../dashboard-worker/dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600, // dashboard较大，保持600KB阈值
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
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
