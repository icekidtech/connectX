/**
 * Chat API Service
 * 
 * Handles conversations and messages
 * WebSocket + REST hybrid for real-time messaging
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/fetch-proxy';

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

// Query keys
const chatQueryKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatQueryKeys.all, 'conversations'] as const,
  conversation: (id: string) =>
    [...chatQueryKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) =>
    [...chatQueryKeys.all, 'messages', conversationId] as const,
};

/**
 * Infinite conversations query
 * Auto-loads next page when user scrolls
 */
export function useInfiniteQueryConversations(pageSize = 20) {
  return useInfiniteQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: async ({ pageParam = 1 }) => {
      return apiGet<PaginatedResponse<Conversation>>(
        `/api/conversations?page=${pageParam}&limit=${pageSize}`
      );
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
 * Single conversation query
 */
export function useQueryConversation(conversationId: string) {
  return useQuery({
    queryKey: chatQueryKeys.conversation(conversationId),
    queryFn: () => apiGet<Conversation>(`/api/conversations/${conversationId}`),
  });
}

/**
 * Infinite messages query (load older messages at top)
 * Messages load in reverse (oldest first for infinite scroll)
 */
export function useInfiniteQueryConversationMessages(
  conversationId: string,
  pageSize = 50
) {
  return useInfiniteQuery({
    queryKey: chatQueryKeys.messages(conversationId),
    queryFn: async ({ pageParam = 1 }) => {
      return apiGet<PaginatedResponse<Message>>(
        `/api/conversations/${conversationId}/messages?page=${pageParam}&limit=${pageSize}`
      );
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
 * Create conversation mutation
 */
export function useMutationCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiPost<Conversation>('/conversations', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}

/**
 * Send message mutation (optimistic update)
 * Message appears immediately, WebSocket updates other users
 */
export function useMutationSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      apiPost<Message>(`/conversations/${conversationId}/messages`, {
        content,
      }),
    onMutate: async (content) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: chatQueryKeys.messages(conversationId),
      });

      const previousData = queryClient.getInfiniteQueryData<
        { pages: PaginatedResponse<Message>[] }
      >(chatQueryKeys.messages(conversationId));

      if (previousData) {
        // Create optimistic message
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          conversationId,
          senderId: 'current-user', // This will be replaced by actual user ID from context
          content,
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to last page
        const newData = {
          ...previousData,
          pages: previousData.pages.map((page, index) => {
            if (index === previousData.pages.length - 1) {
              return {
                ...page,
                data: [...page.data, optimisticMessage],
              };
            }
            return page;
          }),
        };

        queryClient.setInfiniteQueryData(
          chatQueryKeys.messages(conversationId),
          newData
        );
      }

      return { previousData };
    },
    onError: (_err, _content, context) => {
      if (context?.previousData) {
        queryClient.setInfiniteQueryData(
          chatQueryKeys.messages(conversationId),
          context.previousData
        );
      }
    },
    onSuccess: () => {
      // Refetch to get real data
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(conversationId),
      });
    },
  });
}

/**
 * Mark conversation messages as read mutation
 */
export function useMutationMarkConversationRead(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<void>(`/conversations/${conversationId}/mark-read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}

/**
 * Archive conversation mutation
 */
export function useMutationArchiveConversation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<void>(`/conversations/${conversationId}/archive`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}
