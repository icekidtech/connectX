'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Video, 
  Users, 
  Settings, 
  CheckCircle, 
  Bell, 
  Shield,
  LogOut 
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  admin?: boolean;
}

export const navigationItems: NavItem[] = [
  { label: 'Feed', icon: Heart, href: '/dashboard/feed' },
  { label: 'Discover', icon: Users, href: '/dashboard/discover' },
  { label: 'Messages', icon: MessageCircle, href: '/dashboard/messages' },
  { label: 'Streams', icon: Video, href: '/dashboard/streams' },
  { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  { label: 'Verify', icon: CheckCircle, href: '/dashboard/verify' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  { label: 'Admin', icon: Shield, href: '/dashboard/admin', admin: true },
];

interface AppNavigationProps {
  variant?: 'header' | 'sidebar' | 'mobile';
  className?: string;
}

export function AppNavigation({ variant = 'header', className = '' }: AppNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const visibleItems = navigationItems.filter(item => !item.admin);

  if (variant === 'header') {
    return (
      <nav className={`flex items-center gap-1 ${className}`}>
        {visibleItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant={isActive(item.href) ? 'default' : 'ghost'}
              size="sm"
              className={isActive(item.href) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-primary/10'}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    );
  }

  if (variant === 'sidebar') {
    return (
      <nav className={`space-y-2 ${className}`}>
        {visibleItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant={isActive(item.href) ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
              {item.badge && (
                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Button>
          </Link>
        ))}
      </nav>
    );
  }

  if (variant === 'mobile') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-around">
          {/* Show only main items on mobile bottom nav */}
          {[visibleItems[0], visibleItems[1], visibleItems[2], visibleItems[3]].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex-1 relative"
            >
              <Button
                variant={isActive(item.href) ? 'default' : 'ghost'}
                className={`w-full rounded-none justify-center py-6 ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </div>
              </Button>
              {item.badge && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center rounded-full bg-red-500 h-5 w-5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  return null;
}

export function AppNavigationHeader() {
  return (
    <div className="flex items-center gap-2">
      <AppNavigation variant="header" />
      <div className="ml-auto flex items-center gap-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="sm">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AppNavigationSidebar() {
  return <AppNavigation variant="sidebar" className="sticky top-24" />;
}

export function AppMobileNavigation() {
  return <AppNavigation variant="mobile" />;
}
