/**
 * Matching API Service
 * 
 * Handles matching/recommendations and likes
 * Uses infinite queries for swipe card UI (infinite scroll)
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/lib/fetch-proxy';

export interface UserProfile {
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
  photos?: Array<{
    id: string;
    url: string;
    publicId: string;
  }>;
  interests?: Array<{
    id: string;
    name: string;
  }>;
  preferences?: {
    genderPreference: string[];
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    lookingFor: string[];
  };
}

export interface RecommendedUser extends UserProfile {
  compatibilityScore: number;
  distance: number;
}

export interface Match {
  id: string;
  userOne: UserProfile;
  userTwo: UserProfile;
  status: 'liked' | 'matched';
  lastInteraction: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface GetRecommendationsFilters {
  page?: number;
  limit?: number;
  ageMin?: number;
  ageMax?: number;
  maxDistance?: number;
  genderFilter?: string;
  relationshipTypeFilter?: string;
}

// Query keys
const matchingQueryKeys = {
  all: ['matching'] as const,
  recommendations: () => [...matchingQueryKeys.all, 'recommendations'] as const,
  matches: () => [...matchingQueryKeys.all, 'matches'] as const,
};

/**
 * Infinite recommendations query (swipe cards)
 * Auto-loads next page when user scrolls
 */
export function useInfiniteQueryRecommendations(
  filters?: GetRecommendationsFilters,
  pageSize = 10
) {
  const queryString = new URLSearchParams({
    limit: pageSize.toString(),
    ...(filters?.ageMin && { ageMin: filters.ageMin.toString() }),
    ...(filters?.ageMax && { ageMax: filters.ageMax.toString() }),
    ...(filters?.maxDistance && { maxDistance: filters.maxDistance.toString() }),
    ...(filters?.genderFilter && { genderFilter: filters.genderFilter }),
    ...(filters?.relationshipTypeFilter && {
      relationshipTypeFilter: filters.relationshipTypeFilter,
    }),
  }).toString();

  return useInfiniteQuery({
    queryKey: [...matchingQueryKeys.recommendations(), filters],
    queryFn: async ({ pageParam = 1 }) => {
      const url = `/api/matching/recommendations?page=${pageParam}&${queryString}`;
      return apiGet<PaginatedResponse<RecommendedUser>>(url);
    },
    getNextPageParam: (lastPage, pages) => {
      const nextPage = pages.length + 1;
      if (lastPage.data.length < pageSize) return undefined;
      return nextPage;
    },
    initialPageParam: 1,
  });
}

/**
 * Matches query (mutual matches only)
 */
export function useQueryMatches(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...matchingQueryKeys.matches(), page, limit],
    queryFn: () =>
      apiGet<PaginatedResponse<Match>>(
        `/api/matching/matches?page=${page}&limit=${limit}`
      ),
  });
}

/**
 * Like user mutation (optimistic update)
 * When both users like each other, they become a match (status='matched')
 */
export function useMutationLikeUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<void>(`/api/matching/${userId}/like`, {}),
    onSuccess: () => {
      // Invalidate recommendations and matches
      queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.recommendations(),
      });
      queryClient.invalidateQueries({ queryKey: matchingQueryKeys.matches() });
    },
  });
}

/**
 * Unlike user mutation
 */
export function useMutationUnlikeUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiDelete<void>(`/api/matching/${userId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.recommendations(),
      });
      queryClient.invalidateQueries({ queryKey: matchingQueryKeys.matches() });
    },
  });
}

/**
 * Block user mutation
 */
export function useMutationBlockUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<void>(`/api/matching/${userId}/block`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.recommendations(),
      });
    },
  });
}

/**
 * Unblock user mutation
 */
export function useMutationUnblockUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiDelete<void>(`/api/matching/${userId}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.recommendations(),
      });
    },
  });
}
