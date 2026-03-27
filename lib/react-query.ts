import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default query options
const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      // Retry on network errors, max 5 times
      return failureCount < 5;
    },
  },
  mutations: {
    retry: 1, // Retry mutations once on network error
  },
};

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
