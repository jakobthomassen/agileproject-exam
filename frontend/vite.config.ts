import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite to redirect any requests starting with /chat
    // Backend server running on port 8000
    proxy: {
      '/chat': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,  // Set to true if backend uses HTTPS
      }
    }
  }
});