import axios from 'axios';

// Create base API instance with default config
const api = axios.create({
  baseURL: 'https://equiply-jrej.onrender.com'
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  config => {
    // Get token from localStorage - check both token keys for compatibility
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      // Set token in headers for every request
      config.headers['x-access-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle banned status
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && 
        error.response.status === 403 && 
        error.response.data && 
        error.response.data.message && 
        error.response.data.message.includes('banned')) {
      
      // Clear user data only for banned users
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Show banned message
      alert('Your account has been banned. Please contact support.');
      
      // Redirect to home page
      window.location.href = '/';
    } else if (error.response && error.response.status === 401) {
      // Handle unauthorized access (token expired/invalid)
      console.log('Unauthorized access detected');
      
      // Only clear tokens and redirect if specifically requested by the server
      // or if it's a critical authentication failure
      if (error.response.data && error.response.data.clearAuth === true) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
      // For admin routes, be more conservative
      else if (error.config.url.includes('/admin/')) {
        console.log('Admin route 401 - not clearing auth automatically');
      }
      // For other 401s, don't automatically clear auth - let components handle it
    }
    
    return Promise.reject(error);
  }
);

export default api;
