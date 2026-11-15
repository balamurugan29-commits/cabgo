import axios from 'axios';
import { API_BASE_URL } from './constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor for active role or Clerk authentication
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const activeRole = localStorage.getItem('uber_clone_role') || 'customer';
    const activeUserId = localStorage.getItem('uber_clone_user_id');

    config.headers['x-role'] = activeRole;
    if (activeUserId) {
      config.headers['x-user-id'] = activeUserId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error || error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
