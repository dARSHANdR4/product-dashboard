// Product API transport. Keep auth calls on the existing DummyJSON client for now.
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearToken, getToken } from './auth';
import type { ApiError } from '@/types';

const useDatabase = process.env.NEXT_PUBLIC_PRODUCT_API_MODE === 'database';
const productAxios = axios.create({
  baseURL: useDatabase ? '/api' : 'https://dummyjson.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

productAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

productAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const apiError: ApiError = {
      message: typeof data?.message === 'string'
        ? data.message
        : !error.response
          ? 'Network error. Please check your connection.'
          : error.message || `Server error: ${error.response.status}`,
      status: error.response?.status,
      isNetworkError: !error.response,
    };
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(apiError);
  },
);

export default productAxios;
