/**
 * Auth API Service
 * 
 * Handles authentication mutations
 * Uses React Query mutations with httpOnly cookie-based token management
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/fetch-proxy';
import { User } from '@/hooks/use-auth-token';

// Login request/response types
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken?: string; // Not sent in body when using cookies, but kept for type compatibility
}

// Signup request/response types
interface SignupRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

/**
 * Login mutation
 * Backend sets httpOnly cookies on success
 * Frontend receives user profile and should update auth state
 */
export function useMutationLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      return apiPost<AuthResponse>('/api/auth/login', credentials);
    },
    onSuccess: (data) => {
      // User state will be updated by layout (check /api/auth/me)
      // httpOnly cookies are automatically set by backend
      router.push('/dashboard/feed');
    },
  });
}

/**
 * Signup mutation
 * Backend sets httpOnly cookies on success
 */
export function useMutationSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      return apiPost<AuthResponse>('/api/auth/signup', data);
    },
    onSuccess: (data) => {
      // User state will be updated by layout (check /api/auth/me)
      router.push('/dashboard/feed');
    },
  });
}

/**
 * Logout mutation
 * Backend clears httpOnly cookies and invalidates refresh token
 */
export function useMutationLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      return apiPost<{ success: boolean }>('/api/auth/logout', {});
    },
    onSuccess: () => {
      // User state is cleared by useAuthToken.logout()
      // Redirect is handled by useAuthToken.logout()
    },
  });
}

/**
 * Refresh token mutation
 * Called automatically by useAutoTokenRefresh hook
 * Backend reads refreshToken from cookies, returns new accessToken in cookie
 */
export function useMutationRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      return apiPost<{ success: boolean }>('/api/auth/refresh-token', {});
    },
    // No special handling needed, cookies are updated automatically
  });
}
