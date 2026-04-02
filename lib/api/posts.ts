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
import type { InfiniteData } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/fetch-proxy';

// Type definitions
export interface Post {
  id: string;
  authorId: string;
  caption: string;
  hashtags: string[];
  isNsfw: boolean;
  visibility: 'public' | 'friends' | 'private';
  author?: {
    id: string;
    username?: string;
    profile: {
      firstName?: string;
      lastName?: string;
      displayName?: string;
      avatar?: string;
    } | null;
  } | null;
  media: PostMedia[];
  likes?: Array<{
    id: string;
    userId?: string;
    user?: {
      id: string;
    } | null;
  }>;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  liked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostMedia {
  id: string;
  postId: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  publicId: string;
  displayOrder: number;
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

function togglePostLikeState(post: Post): Post {
  const currentlyLiked = Boolean(post.liked ?? post.isLiked);
  const liked = !currentlyLiked;

  return {
    ...post,
    liked,
    isLiked: liked,
    likeCount: Math.max(0, (post.likeCount ?? 0) + (liked ? 1 : -1)),
  };
}

/**
 * Infinite feed query (Instagram-style)
 * Auto-loads next page when user scrolls
 */
export function useInfiniteQueryFeed(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: postsQueryKeys.feed(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiGet<PaginatedResponse<Post> | Post[]>(
        `/posts/feed?page=${pageParam}&limit=${pageSize}`
      );

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
    queryFn: async () => {
      const response = await apiGet<PaginatedResponse<{ id: string; email: string }> | { id: string; email: string }[]>(
        `/posts/${postId}/likes?page=${page}&limit=${limit}`
      );

      return normalizePaginatedResponse(response, page, limit);
    },
  });
}

/**
 * Comments query
 */
export function useQueryComments(
  postId: string,
  page = 1,
  limit = 10,
  enabled = true,
) {
  return useQuery({
    queryKey: postsQueryKeys.comments(postId),
    queryFn: async () => {
      const response = await apiGet<PaginatedResponse<Comment> | Comment[]>(
        `/posts/${postId}/comments?page=${page}&limit=${limit}`
      );

      return normalizePaginatedResponse(response, page, limit);
    },
    enabled,
  });
}

/**
 * Nested comment replies query
 */
export function useQueryCommentReplies(commentId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: postsQueryKeys.commentReplies(commentId),
    queryFn: async () => {
      const response = await apiGet<PaginatedResponse<Comment> | Comment[]>(
        `/posts/comment/${commentId}/replies?page=${page}&limit=${limit}`
      );

      return normalizePaginatedResponse(response, page, limit);
    },
  });
}

/**
 * Create post mutation
 */
export function useMutationCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => apiPost<Post>('/posts', data),
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
      apiPut<Post>(`/posts/${postId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.feed() });
    },
  });
}

/**
 * Delete post mutation
 */
export function useMutationDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiDelete<void>(`/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.feed() });
    },
  });
}

/**
 * Like post mutation (optimistic update)
 */
export function useMutationLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiPost<Post>(`/posts/${postId}/like`, {}),
    onMutate: async (postId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: postsQueryKeys.post(postId) }),
        queryClient.cancelQueries({ queryKey: postsQueryKeys.feed() }),
      ]);

      const previousPost = queryClient.getQueryData<Post>(postsQueryKeys.post(postId));
      const previousFeed = queryClient.getQueryData<InfiniteData<PaginatedResponse<Post>>>(
        postsQueryKeys.feed(),
      );

      if (previousPost) {
        queryClient.setQueryData(postsQueryKeys.post(postId), togglePostLikeState(previousPost));
      }

      if (previousFeed) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
          postsQueryKeys.feed(),
          {
            ...previousFeed,
            pages: previousFeed.pages.map((page) => ({
              ...page,
              data: page.data.map((post) =>
                post.id === postId ? togglePostLikeState(post) : post,
              ),
            })),
          },
        );
      }

      return { previousPost, previousFeed, postId };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          postsQueryKeys.post(context.postId),
          context.previousPost,
        );
      }

      if (context?.previousFeed) {
        queryClient.setQueryData(postsQueryKeys.feed(), context.previousFeed);
      }
    },
    onSuccess: (post) => {
      queryClient.setQueryData(postsQueryKeys.post(post.id), post);

      queryClient.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
        postsQueryKeys.feed(),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item.id === post.id ? { ...item, ...post } : item,
              ),
            })),
          };
        },
      );
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.feed() });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.post(postId) });
    },
  });
}

/**
 * Comment on post mutation
 */
export function useMutationCommentOnPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CreateCommentDto }) =>
      apiPost<Comment>(`/posts/${postId}/comment`, data),
    onSuccess: (_data, variables) => {
      const postId = variables.postId;
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.feed() });
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
      apiPut<Comment>(`/posts/comment/${commentId}`, data),
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
    mutationFn: () => apiDelete<void>(`/posts/comment/${commentId}`),
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
    mutationFn: () => apiPost<void>(`/posts/comment/${commentId}/like`, {}),
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
