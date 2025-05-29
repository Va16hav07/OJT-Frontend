import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: {
      overlay: false
    }
  },
  build: {
    outDir: 'dist',
    // Generate a _redirects file for Netlify or Vercel to handle client-side routing
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-router-dom', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env': {
      REACT_APP_GOOGLE_CLIENT_ID: JSON.stringify(process.env.REACT_APP_GOOGLE_CLIENT_ID || '413786747217-shtsu3g52852filvh897jc6si15grtkg.apps.googleusercontent.com'),
      REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || 'https://equiply-jrej.onrender.com')
    }
  }
});
