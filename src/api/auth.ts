// api/auth.ts — Authentication service
import axios from 'axios';
import type { LoginCredentials, AuthUser } from '@/types';

/**
 * Logs in through our same-origin API route so the browser does not call
 * DummyJSON directly and trigger its cross-origin preflight restrictions.
 */
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await axios.post<AuthUser>('/api/auth/login', {
    username: credentials.username,
    password: credentials.password,
    expiresInMins: 60,
  }, {
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}
