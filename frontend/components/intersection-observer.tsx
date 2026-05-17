/**
 * Intersection Observer Component
 *
 * Reusable component for infinite scroll / lazy loading
 * Triggers callback when element becomes visible
 * Used by: feed, recommendations, conversations, messages
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface IntersectionObserverProps {
  /**
   * Callback when element becomes visible
   */
  onVisible: () => void;

  /**
   * Optional loading indicator
   */
  isLoading?: boolean;

  /**
   * Intersection observer options
   */
  threshold?: number | number[];
  rootMargin?: string;
}

export function IntersectionObserver({
  onVisible,
  isLoading = false,
  threshold = 0.1,
  rootMargin = '100px',
}: IntersectionObserverProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isLoading) {
        onVisible();
      }
    },
    [onVisible, isLoading]
  );

  useEffect(() => {
    const observer = new window.IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className="flex justify-center py-4"
      aria-busy={isLoading}
      aria-label="Load more"
    >
      {isLoading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />}
    </div>
  );
}

/**
 * Hook version for direct use in components
 */
export function useIntersection(
  callback: () => void,
  options?: {
    threshold?: number | number[];
    rootMargin?: string;
    root?: Element | null;
  }
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '100px',
        root: options?.root ?? null,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return ref;
}
