'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth-token';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, () => {
          this.setState({ hasError: false, error: null });
        });
      }
      return (
          <div className="w-full h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <CardTitle>Something went wrong</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {this.state.error.message}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      sessionStorage.removeItem('user');
                      window.location.href = '/auth/login';
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }

    return this.props.children;
  }
}

/**
 * Error handler for mutations and API calls
 * Shows error toast and handles specific error codes
 */
export function useMutationErrorHandler() {
  const router = useRouter();
  const { logout } = useAuth();

  return (error: unknown) => {
    const err = error as any;

    // 401 Unauthorized - logout and redirect
    if (err?.response?.status === 401) {
      logout();
      router.push('/auth/login');
      return;
    }

    // 403 Forbidden
    if (err?.response?.status === 403) {
      console.error('Access denied');
      return;
    }

    // 404 Not Found
    if (err?.response?.status === 404) {
      console.error('Resource not found');
      return;
    }

    // Network error
    if (!navigator.onLine) {
      console.error('You are offline');
      return;
    }

    console.error('An error occurred:', error);
  };
}

/**
 * Offline indicator component
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg flex items-center gap-2 z-50">
      <AlertCircle className="w-4 h-4" />
      <span className="text-sm font-medium">You are offline. Check your connection.</span>
    </div>
  );
}
