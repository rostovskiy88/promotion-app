import axios, { AxiosResponse, AxiosError } from 'axios';

// Create a centralized Axios instance
const httpClient = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add common headers, authentication, etc.
httpClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: new Date().getTime(),
    };
    
    console.log(`🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common response logic
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ HTTP Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    
    // Handle common error cases
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - redirecting to login');
      // Could trigger logout here
    }
    
    if (error.response && error.response.status >= 500) {
      console.log('🛠️ Server Error - could show user-friendly message');
    }
    
    return Promise.reject(error);
  }
);

export default httpClient; 