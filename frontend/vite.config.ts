import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite to redirect any requests starting with /chat
    // to your backend server running on port 8000
    proxy: {
      '/chat': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false, // Use if your backend is not HTTPS
      }
    }
  }
});