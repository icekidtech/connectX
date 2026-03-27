/**
 * Posts API Service
 * 
 * Handles posts and comments queries/mutations
 * Uses React Query for infinite scroll (Instagram-style feed)
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/fetch-proxy';

// Type definitions
export interface Post {
  id: string;
  userId: string;
  caption: string;
  hashtags: string[];
  isNsfw: boolean;
  visibility: 'public' | 'friends' | 'private';
  mediaCount: number;
  media: PostMedia[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostMedia {
  id: string;
  postId: string;
  type: 'image' | 'video';
  url: string;
  publicId: string;
  order: number;
}

export interface Comment {
  id: string;
  postId?: string;
  parentCommentId?: string;
  authorId: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  caption: string;
  hashtags: string[];
  isNsfw: boolean;
  visibility: 'public' | 'friends' | 'private';
  mediaUrls?: string[];
}

export interface UpdatePostDto {
  caption?: string;
  hashtags?: string[];
  isNsfw?: boolean;
  visibility?: 'public' | 'friends' | 'private';
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

// Query keys
const postsQueryKeys = {
  all: ['posts'] as const,
  feed: () => [...postsQueryKeys.all, 'feed'] as const,
  post: (id: string) => [...postsQueryKeys.all, 'post', id] as const,
  likes: (postId: string) => [...postsQueryKeys.all, 'likes', postId] as const,
  comments: (postId: string) => [...postsQueryKeys.all, 'comments', postId] as const,
  commentReplies: (commentId: string) => [...postsQueryKeys.all, 'replies', commentId] as const,
};

/**
 * Infinite feed query (Instagram-style)
 * Auto-loads next page when user scrolls
 */
export function useInfiniteQueryFeed(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: postsQueryKeys.feed(),
    queryFn: async ({ pageParam = 1 }) => {
      return apiGet<PaginatedResponse<Post>>(
        `/api/posts/feed?page=${pageParam}&limit=${pageSize}`
      );
    },
    getNextPageParam: (lastPage, pages) => {
      // Calculate next page number
      const nextPage = pages.length + 1;
      // Stop if we've fetched all posts
      if (lastPage.data.length < pageSize) return undefined;
      return nextPage;
    },
    initialPageParam: 1,
  });
}

/**
 * Single post query
 */
export function useQueryPost(postId: string) {
  return useQuery({
    queryKey: postsQueryKeys.post(postId),
    queryFn: () => apiGet<Post>(`/api/posts/${postId}`),
  });
}

/**
 * Post likes query
 */
export function useQueryPostLikes(postId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: postsQueryKeys.likes(postId),
    queryFn: () =>
      apiGet<PaginatedResponse<{ id: string; email: string }>>(
        `/api/posts/${postId}/likes?page=${page}&limit=${limit}`
      ),
  });
}

/**
 * Comments query
 */
export function useQueryComments(postId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: postsQueryKeys.comments(postId),
    queryFn: () =>
      apiGet<PaginatedResponse<Comment>>(
        `/api/posts/${postId}/comments?page=${page}&limit=${limit}`
      ),
  });
}

/**
 * Nested comment replies query
 */
export function useQueryCommentReplies(commentId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: postsQueryKeys.commentReplies(commentId),
    queryFn: () =>
      apiGet<PaginatedResponse<Comment>>(
        `/api/posts/comment/${commentId}/replies?page=${page}&limit=${limit}`
      ),
  });
}

/**
 * Create post mutation
 */
export function useMutationCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => apiPost<Post>('/api/posts', data),
    onSuccess: () => {
      // Invalidate feed to refetch
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.feed() });
    },
  });
}

/**
 * Update post mutation
 */
export function useMutationUpdatePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePostDto) =>
      apiPut<Post>(`/api/posts/${postId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.feed() });
    },
  });
}

/**
 * Delete post mutation
 */
export function useMutationDeletePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiDelete<void>(`/api/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.feed() });
    },
  });
}

/**
 * Like post mutation (optimistic update)
 */
export function useMutationLikePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<void>(`/api/posts/${postId}/like`, {}),
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: postsQueryKeys.post(postId) });
      const previous = queryClient.getQueryData<Post>(postsQueryKeys.post(postId));

      if (previous) {
        queryClient.setQueryData(postsQueryKeys.post(postId), {
          ...previous,
          isLiked: !previous.isLiked,
          likeCount: previous.isLiked
            ? previous.likeCount - 1
            : previous.likeCount + 1,
        });
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(postsQueryKeys.post(postId), context.previous);
      }
    },
  });
}

/**
 * Comment on post mutation
 */
export function useMutationCommentOnPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentDto) =>
      apiPost<Comment>(`/api/posts/${postId}/comment`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.post(postId) });
    },
  });
}

/**
 * Update comment mutation
 */
export function useMutationUpdateComment(commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string }) =>
      apiPut<Comment>(`/api/posts/comment/${commentId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' && query.queryKey[1] === 'comments',
      });
    },
  });
}

/**
 * Delete comment mutation
 */
export function useMutationDeleteComment(commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiDelete<void>(`/api/posts/comment/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' && query.queryKey[1] === 'comments',
      });
    },
  });
}

/**
 * Like comment mutation (optimistic update)
 */
export function useMutationLikeComment(commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<void>(`/api/posts/comment/${commentId}/like`, {}),
    onMutate: async () => {
      // Optimistic update - need to handle multiple comment queries
      await queryClient.cancelQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' && query.queryKey[1] === 'comments',
      });

      // For now, just refetch on success
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' && query.queryKey[1] === 'comments',
      });
    },
  });
}
