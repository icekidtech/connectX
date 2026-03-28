/**
 * useAuthToken Hook
 * 
 * Manages user authentication state
 * 
 * SECURITY MODEL:
 * - Tokens are stored in httpOnly Secure SameSite cookies (NOT in JS)
 * - This hook stores user profile in React memory only
 * - JS cannot access the token (browser handles cookie transmission automatically)
 * - On logout, backend clears cookies
 */

'use client';

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bio?: string;
  profilePhoto?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseAuthTokenReturn {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

export function useAuthToken(): UseAuthTokenReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is still authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user info
        // This will fail with 401 if token expired or invalid
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/me`, {
          credentials: 'include', // Send cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          // Token expired or invalid, clear user state
          setUser(null);
        }
      } catch (error) {
        // Network error, user might be offline
        // Keep existing user state if any
        console.error('Failed to check auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint
      // Backend will clear httpOnly cookies
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state regardless of backend response
      setUser(null);
      // Redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  return {
    user,
    isAuthenticated: !!user,
    setUser,
    logout,
    isLoading,
  };
}

/**
 * Context + Provider for passing auth state through component tree
 * (Optional, for avoiding prop drilling in deeply nested components)
 */

interface AuthContextType extends UseAuthTokenReturn {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthToken();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): UseAuthTokenReturn {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
