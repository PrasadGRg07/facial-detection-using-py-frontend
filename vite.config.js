import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api/* requests to Flask in development
      '/video_feed':    'http://localhost:5000',
      '/status':        'http://localhost:5000',
      '/known_faces':   'http://localhost:5000',
      '/register_face': 'http://localhost:5000',
      '/remove_face':   'http://localhost:5000',
      '/detection_log': 'http://localhost:5000',
    },
  },
});
