'use client';

import { useAuth } from '@/hooks/use-auth-token';
import { AppMobileNavigation, AppNavigationSidebar } from '@/components/app-navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Keep original dashboard landing page layout unchanged.
  if (pathname === '/dashboard') {
    return <>{children}</>;
  }

  // Shared shell for dashboard sub-routes (feed, discover, messages, etc.)
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="hidden lg:block">
            <AppNavigationSidebar />
          </aside>

          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>

      <AppMobileNavigation />
      <div className="h-20 lg:hidden" />
    </div>
  );
}
