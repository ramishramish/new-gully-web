import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API server (npm start, port 8080) handles /api and /uploads.
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
    },
  },
});
