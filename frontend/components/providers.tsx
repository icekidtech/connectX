/**
 * App Providers
 * 
 * Centralized place for all context providers and global hooks
 * This is a client component that wraps the app with necessary providers
 */

'use client';

import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth-token';
import { useAutoTokenRefresh } from '@/hooks/use-auto-token-refresh';

/**
 * Client component that runs token refresh and mounted providers
 */
function TokenRefreshManager() {
  useAutoTokenRefresh();
  return null; // No UI
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TokenRefreshManager />
          {children}
          {/* React Query DevTools (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
