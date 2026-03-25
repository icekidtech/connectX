'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PostCard } from './post-card';
import { Loader2 } from 'lucide-react';

interface Post {
  id: string;
  caption: string;
  author: {
    id: string;
    profile: {
      displayName: string;
      avatar: string;
    };
  };
  media: Array<{
    id: string;
    url: string;
    mediaType: string;
  }>;
  likeCount: number;
  commentCount: number;
  isNsfw: boolean;
  hashtags: string[];
  createdAt: string;
  liked?: boolean;
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch (error) {
        console.error('[v0] Failed to parse token:', error);
      }
    }

    fetchFeed();
  }, []);

  const fetchFeed = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/feed?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      if (pageNum === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      
      setHasMore(data.length === 10);
    } catch (error) {
      console.error('[v0] Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedPost = await response.json();
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (error) {
      console.error('[v0] Failed to like post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error) {
      console.error('[v0] Failed to delete post:', error);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <Card className="border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">No posts yet</p>
            <p className="text-muted-foreground">
              Follow someone or create a post to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDeletePost}
              onLike={handleLike}
              currentUserId={currentUserId}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="border-primary/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
