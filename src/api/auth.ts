// api/auth.ts — Authentication service
import axiosInstance from '@/lib/axios';
import type { LoginCredentials, AuthUser } from '@/types';

/**
 * Logs in a user via POST /auth/login
 * Returns the full AuthUser including token on success.
 */
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await axiosInstance.post<AuthUser>('/auth/login', {
    username: credentials.username,
    password: credentials.password,
    expiresInMins: 60,
  });
  return response.data;
}
