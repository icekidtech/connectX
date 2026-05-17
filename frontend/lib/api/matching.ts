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

export interface RecommendedUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  profilePhoto?: string;
  profilePhotoUrl?: string;
  location?: string | { latitude: number; longitude: number };
  distance?: number;
  age?: number;
  photos?: Array<{
    id: string;
    url: string;
    publicId: string;
  }>;
  interests?: Array<{
    id: string;
    name: string;
  }>;
  commonInterests?: string[];
  preferences?: {
    genderPreference: string[];
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    lookingFor: string[];
  };
  displayName?: string;
  avatar?: string;
  lookingFor?: string[];
  compatibilityScore: number;
}

export interface Match {
  id: string;
  userOne: UserProfile;
  userTwo: UserProfile;
  status: 'liked' | 'matched';
  lastInteraction: string;
}

export interface FollowingUser {
  followId: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  profilePhotoUrl?: string | null;
  followedAt: string;
  status: 'liked' | 'matched' | 'messaged' | 'reported';
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
  following: (page: number, limit: number) => [...matchingQueryKeys.all, 'following', page, limit] as const,
};

function normalizePaginatedResponse<T>(
  response: PaginatedResponse<T> | T[],
  page: number,
  limit: number,
): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    return {
      data: response,
      page,
      limit,
      total: response.length,
    };
  }

  return response;
}

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
      const baseParams = new URLSearchParams({ page: String(pageParam) });
      const url = queryString
        ? `/matching/recommendations?${baseParams.toString()}&${queryString}`
        : `/matching/recommendations?${baseParams.toString()}`;
      const response = await apiGet<PaginatedResponse<RecommendedUser> | RecommendedUser[]>(url);

      return normalizePaginatedResponse(response, Number(pageParam), pageSize);
    },
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.page * lastPage.limit;
      if (loadedCount >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
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
        `/matching/matches?page=${page}&limit=${limit}`
      ),
  });
}

/**
 * Following query (users current user has liked)
 */
export function useQueryFollowing(page = 1, limit = 20) {
  return useQuery({
    queryKey: matchingQueryKeys.following(page, limit),
    queryFn: async () => {
      const response = await apiGet<PaginatedResponse<FollowingUser> | FollowingUser[]>(
        `/matching/following?page=${page}&limit=${limit}`
      );

      return normalizePaginatedResponse(response, page, limit);
    },
  });
}

/**
 * Like user mutation (optimistic update)
 * When both users like each other, they become a match (status='matched')
 */
export function useMutationLikeUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiPost<void>(`/matching/${userId}/like`, {}),
    onSuccess: () => {
      // Invalidate recommendations and matches
      queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.recommendations(),
      });
      queryClient.invalidateQueries({ queryKey: matchingQueryKeys.matches() });
      queryClient.invalidateQueries({ queryKey: [...matchingQueryKeys.all, 'following'] });
    },
  });
}

/**
 * Unlike user mutation
 */
export function useMutationUnlikeUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiDelete<void>(`/matching/${userId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.recommendations(),
      });
      queryClient.invalidateQueries({ queryKey: matchingQueryKeys.matches() });
      queryClient.invalidateQueries({ queryKey: [...matchingQueryKeys.all, 'following'] });
    },
  });
}

/**
 * Block user mutation
 */
export function useMutationBlockUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<void>(`/matching/${userId}/block`, {}),
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
    mutationFn: () => apiDelete<void>(`/matching/${userId}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.recommendations(),
      });
    },
  });
}
