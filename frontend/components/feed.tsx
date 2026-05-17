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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQueryFeed(10);

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
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-gradient rounded-full h-14 w-14 border-4 border-warm-accent/20 border-t-warm-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-gradient-to-r from-destructive/10 to-destructive/5">
        <CardContent className="pt-6 pb-6">
          <p className="text-destructive font-semibold">Failed to load posts. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  // Flatten pages into a single array and derive current user's like state.
  const posts = (data?.pages.flatMap((page) => page.data ?? []) || []).map((post) => {
    const likedFromRelations = Boolean(
      user?.id &&
      Array.isArray(post.likes) &&
      post.likes.some((like) => like?.userId === user.id || like?.user?.id === user.id)
    );
    const liked = Boolean(post.liked ?? post.isLiked ?? likedFromRelations);

    return {
      ...post,
      liked,
      isLiked: liked,
    };
  });

  if (posts.length === 0) {
    return (
      <Card className="border-warm-accent/20 bg-gradient-to-br from-card to-card/95">
        <CardContent className="pt-16 pb-16 text-center">
          <p className="text-xl font-bold text-warm-accent mb-2">No posts yet</p>
          <p className="text-muted-foreground font-medium">
            Follow someone or create a post to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
          style={{ animation: `fade-in-up 0.5s ease-out ${index * 50}ms both` }}
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
        <div className="flex justify-center py-8">
          <Loader2 className="w-7 h-7 animate-spin text-warm-accent" />
        </div>
      )}
    </div>
  );
}
