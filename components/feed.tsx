'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Trash2, Flag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

  useEffect(() => {
    fetchFeed();
  }, [page]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/feed?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('[v0] Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
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
    return <div className="text-center py-8">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No posts yet. Follow someone or create a post to get started!
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {/* Post Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-semibold">
                    {post.author.profile.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {post.author.profile.displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Post Content */}
            <CardContent className="space-y-4">
              {/* NSFW Warning */}
              {post.isNsfw && (
                <div className="bg-accent/10 border border-accent px-3 py-2 rounded text-sm text-accent font-medium">
                  Adult Content Warning
                </div>
              )}

              {/* Caption */}
              {post.caption && <p className="text-sm">{post.caption}</p>}

              {/* Hashtags */}
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/dashboard/hashtag/${tag}`}
                      className="text-primary hover:underline text-xs"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Media */}
              {post.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {post.media.slice(0, 4).map((media) => (
                    <div key={media.id} className="relative aspect-square bg-muted rounded overflow-hidden">
                      {media.mediaType.startsWith('image') ? (
                        <Image
                          src={media.url}
                          alt="Post media"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span>{post.likeCount} likes</span>
                <span>{post.commentCount} comments</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className="w-4 h-4" />
                  Like
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <div className="flex gap-2 justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
