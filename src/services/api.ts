import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Direct connection to auth server
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - simplified to avoid unnecessary refresh attempts
api.interceptors.response.use(
  (res) => {
    console.log('API Response Success:', res.config.method?.toUpperCase(), res.config.url, res.status);
    return res;
  },
  async (error) => {
    console.error('API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
    
    // Don't do automatic refresh attempts - let the calling code handle auth failures
    return Promise.reject(error);
  },
);

export default api;
