
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add proxy for API requests when using Vite's dev server
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Improved optimizeDeps configuration for better compatibility
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-toast',
      'sonner',
    ],
  },
  build: {
    // Enable sourcemaps for debugging
    sourcemap: true,
    // Improve build performance
    chunkSizeWarningLimit: 1600,
  }
}));
