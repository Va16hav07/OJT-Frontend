import axios from 'axios';

// Create base API instance with default config
const api = axios.create({
  baseURL: 'https://equiply-jrej.onrender.com'
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  config => {
    // Get token from localStorage for every request
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in headers for every request
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle banned status
api.interceptors.response.use(
  response => response,
  error => {
    // Check if the error is about a banned account
    if (error.response && 
        error.response.status === 403 && 
        error.response.data && 
        error.response.data.message && 
        error.response.data.message.includes('banned')) {
      
      // Clear user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show banned message
      alert('Your account has been banned. Please contact support.');
      
      // Redirect to home page
      window.location.href = '/';
    } else if (error.response && error.response.status === 401) {
      // Handle unauthorized access (token expired/invalid)
      console.log('Unauthorized access - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here if it's an admin API call
      if (!error.config.url.includes('/admin/')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
