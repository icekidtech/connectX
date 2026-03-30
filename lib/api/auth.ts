/**
 * Auth API Service
 * 
 * Handles authentication mutations
 * Uses React Query mutations with httpOnly cookie-based token management
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/fetch-proxy';
import { User, useAuth } from '@/hooks/use-auth-token';

// Login request/response types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  username: string;
  message: string;
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
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      await apiPost<LoginResponse>('/auth/login', credentials);
      // Immediately sync auth context from cookie-backed session.
      return apiGet<User>('/auth/me');
    },
    onSuccess: (currentUser) => {
      setUser(currentUser);
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
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      await apiPost<LoginResponse>('/auth/signup', data);
      return apiGet<User>('/auth/me');
    },
    onSuccess: (currentUser) => {
      setUser(currentUser);
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
      return apiPost<{ success: boolean }>('/auth/logout', {});
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
      return apiPost<{ success: boolean }>('/auth/refresh-token', {});
    },
    // No special handling needed, cookies are updated automatically
  });
}
