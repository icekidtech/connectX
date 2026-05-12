'use client';

/**
 * Auth utility functions for client-side authentication
 */

export interface AuthToken {
  token: string;
  expiresAt: number;
}

const TOKEN_KEY = 'connect_auth_token';
const USER_KEY = 'connect_auth_user';

/**
 * Store auth token and user data in localStorage
 */
export function setAuthToken(token: string, user: any) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiresAt }));
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;

  const { token, expiresAt } = JSON.parse(stored);

  // Check if token is expired
  if (Date.now() > expiresAt) {
    clearAuthToken();
    return null;
  }

  return token;
}

/**
 * Get stored user data
 */
export function getAuthUser(): any | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clear auth token and user data
 */
export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Logout user
 */
export function logout() {
  clearAuthToken();
  // Redirect to login (handled by component)
}

/**
 * Create authorization header
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
