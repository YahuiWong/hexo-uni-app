import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';  // UniApp 官方 Vite 插件
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),  // 必须的 UniApp 插件
    
  ],

  resolve: {
    alias: {
      // 常用路径别名，方便导入
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },

  // 开发服务器配置（可选，用于 H5 跨域代理你的博客 API）
  server: {
    host: true,                  // 允许局域网访问
    port: 5174,                  // 开发端口
    open: true,                  // 自动打开浏览器
    proxy: {
      // 如果你在 H5 端调试，想避免跨域，可以代理到你的博客域名
      '/api-blog': {
        target: 'https://blog.yahui.wang',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-blog/, '/api'),
      },
    },
  },

  // 构建优化（可选）
  build: {
    target: 'es2015',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,     // 生产环境移除 console.log
        drop_debugger: true,
      },
    },
  },

  // CSS 配置（可选）
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'color-functions', 'import'],  /* Silences @import and related warnings */
      },
    },
  },
});