'use client';

import { useCallback } from 'react';
import { useInfiniteQueryFeed, useMutationLikePost, useMutationDeletePost } from '@/lib/api/posts';
import { useAuth } from '@/hooks/use-auth-token';
import { useIntersection } from './intersection-observer';
import { PostCard } from './post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function Feed() {
  const { user } = useAuth();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQueryFeed(10);

  const likeMutation = useMutationLikePost();
  const deleteMutation = useMutationDeletePost();

  // Get the last post element ref for intersection observer
  const lastPostRef = useIntersection(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  );

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(postId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-border bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6 pb-6">
          <p className="text-destructive">Failed to load posts. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  // Flatten pages into single array of posts
  const posts = data?.pages.flatMap((page) => page.data ?? []) || [];

  if (posts.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">No posts yet</p>
          <p className="text-muted-foreground">
            Follow someone or create a post to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
        >
          <PostCard
            post={post}
            onDelete={handleDeletePost}
            onLike={handleLike}
            currentUserId={user?.id}
          />
        </div>
      ))}

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
