import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/admin': 'http://localhost:8000',
      '/teams': 'http://localhost:8000',
      '/scoreboard': 'http://localhost:8000',
      '/evaluations': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      // 필요한 엔드포인트 모두 추가
    }
  }
});
