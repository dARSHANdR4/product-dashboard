// lib/axios.ts — Shared Axios instance
// All API calls go through this instance — never create raw axios calls in components.

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearToken } from './auth';
import type { ApiError } from '@/types';

const BASE_URL = 'https://dummyjson.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the auth token to every outgoing request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Centralizes error handling:
//   401 → auto-logout + redirect to /login
//   network errors → normalized ApiError shape
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred.',
      isNetworkError: false,
    };

    if (!error.response) {
      // Network error — no response received
      apiError.isNetworkError = true;
      apiError.message = 'Network error. Please check your connection.';
    } else {
      apiError.status = error.response.status;
      const data = error.response.data as Record<string, unknown>;
      apiError.message =
        (data?.message as string) ||
        error.message ||
        `Server error: ${error.response.status}`;

      if (error.response.status === 401) {
        // Auto-logout and redirect
        clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(apiError);
  }
);

export default axiosInstance;
