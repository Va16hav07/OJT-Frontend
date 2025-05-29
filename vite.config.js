import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['axios']
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  define: {
    'process.env': {
      REACT_APP_GOOGLE_CLIENT_ID: JSON.stringify(process.env.REACT_APP_GOOGLE_CLIENT_ID || '413786747217-shtsu3g52852filvh897jc6si15grtkg.apps.googleusercontent.com'),
      REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || 'https://equiply-jrej.onrender.com')
    }
  }
});
