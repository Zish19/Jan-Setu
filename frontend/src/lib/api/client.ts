import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from './types';

// In a real implementation, we'd import Firebase Auth to get the token:
// import { auth } from '@/lib/firebase/config';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api/backend/api/v1'; // Vercel rewrite route
  }
  return 'http://localhost:8000/api/v1';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Firebase JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // const user = auth.currentUser;
    // if (user) {
    //   const token = await user.getIdToken();
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize Errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Assumes backend always wraps in ApiResponse
  },
  (error: AxiosError) => {
    // Normalize to standard ApiResponse format even on network errors
    const standardError: ApiResponse = {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
      }
    };
    
    if (error.response?.data) {
      // If backend returned a formatted error, use it
      Object.assign(standardError, error.response.data);
    }
    
    return Promise.reject(standardError);
  }
);

export default apiClient;
