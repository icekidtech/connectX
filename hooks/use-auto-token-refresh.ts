/**
 * useAutoTokenRefresh Hook
 * 
 * Automatically refreshes the auth token before it expires
 * Only refreshes if user is detected as active
 * Runs silently - user never sees a logout
 * 
 * Strategy:
 * - Check if user is online every 15 minutes
 * - If online and active (last action < 5 min), refresh token
 * - If token refresh fails (401), redirect to login
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth-token';

const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes (consider active if activity within this time)

export function useAutoTokenRefresh() {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated]);

  // Handle online/offline status
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleOnline = async () => {
      // Device came online, try to refresh token
      await refreshToken();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      // Check if user is active
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      const isActive = timeSinceLastActivity < ACTIVITY_TIMEOUT;

      if (!isActive) {
        // User inactive, skip refresh
        return;
      }

      // Call refresh endpoint
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include', // Send refreshToken cookie, receive new accessToken cookie
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Refresh token expired, redirect to login
          await logout();
          router.push('/auth/login');
        }
        return;
      }

      // Token refreshed successfully, update activity timer
      lastActivityRef.current = Date.now();
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Don't logout on network errors, user might be offline
    }
  }, [logout, router]);

  // Set up periodic refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial setup
    lastActivityRef.current = Date.now();

    // Refresh every 15 minutes
    intervalRef.current = setInterval(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, refreshToken]);

  // No UI, just side effects
  return null;
}
