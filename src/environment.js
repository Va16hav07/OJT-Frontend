// This file provides a consistent way to access environment variables
// regardless of build system (Vite, Create React App, etc.)

// Define a global process object if it doesn't exist
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} };
}

// Import environment variables from Vite if available
if (import.meta && import.meta.env) {
  Object.keys(import.meta.env).forEach(key => {
    window.process.env[key] = import.meta.env[key];
  });
}

// Add your environment variables here with fallbacks
window.process.env.REACT_APP_GOOGLE_CLIENT_ID = 
  window.process.env.REACT_APP_GOOGLE_CLIENT_ID || 
  import.meta?.env?.VITE_GOOGLE_CLIENT_ID || 
  '413786747217-shtsu3g52852filvh897jc6si15grtkg.apps.googleusercontent.com';

// API URL
window.process.env.REACT_APP_API_URL = 
  window.process.env.REACT_APP_API_URL ||
  import.meta?.env?.VITE_API_URL ||
  'https://equiply-jrej.onrender.com';

export default window.process.env;
