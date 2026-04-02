'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Trash2, Flag, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useQueryComments, useMutationCommentOnPost } from '@/lib/api/posts';

interface PostCardProps {
  post: {
    id: string;
    authorId?: string;
    caption: string;
    author?: {
      id?: string;
      username?: string;
      profile?: {
        displayName?: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
      } | null;
    } | null;
    media: Array<{
      id: string;
      url?: string;
      mediaUrl?: string;
      mediaType: string;
    }>;
    likeCount: number;
    commentCount: number;
    isNsfw: boolean;
    hashtags: string[];
    createdAt: string;
    liked?: boolean;
  };
  onDelete?: (postId: string) => void;
  onLike?: (postId: string) => void;
  currentUserId?: string;
}

export function PostCard({ post, onDelete, onLike, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const authorId = post.author?.id || post.authorId || '';
  const authorDisplayName =
    post.author?.profile?.displayName ||
    [post.author?.profile?.firstName, post.author?.profile?.lastName].filter(Boolean).join(' ') ||
    post.author?.username ||
    'Unknown User';
  const authorAvatar = post.author?.profile?.avatar || '';
  const authorInitial = authorDisplayName.charAt(0).toUpperCase() || '?';
  const profileHref = authorId ? `/profile/${authorId}` : '/dashboard/profile';

  const mediaItems = post.media
    .map((item) => ({
      id: item.id,
      url: item.url || item.mediaUrl || '',
      mediaType: item.mediaType,
    }))
    .filter((item) => item.url.length > 0);

  // Fetch comments when section is opened
  const { data: commentsData, isLoading: isLoadingComments } = useQueryComments(
    post.id,
    1,
    10,
    showComments,
  );
  const comments = commentsData?.data || [];

  // Mutation for posting comments
  const commentMutation = useMutationCommentOnPost();

  const handleShowComments = () => {
    setShowComments(!showComments);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    commentMutation.mutate(
      { postId: post.id, data: { content: commentText } },
      {
        onSuccess: () => {
          setCommentText('');
        },
      }
    );
  };

  const isOwner = Boolean(currentUserId && authorId && currentUserId === authorId);

  return (
    <Card className="border-border mb-6 overflow-hidden hover:border-primary/50 transition">
      {/* Post Header */}
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <Link href={profileHref} className="flex items-center gap-3 hover:opacity-80">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden relative">
              {authorAvatar ? (
                <Image
                  src={authorAvatar}
                  alt={authorDisplayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {authorInitial}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{authorDisplayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(post.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {!isOwner && (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Flag className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Post Content */}
      <CardContent className="space-y-3 pt-4">
        {/* Caption */}
        <p className="text-foreground whitespace-pre-wrap">{post.caption}</p>

        {/* Media */}
        {mediaItems.length > 0 && (
          <div className={`grid gap-2 ${mediaItems.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {mediaItems.map((item) => (
              <div key={item.id} className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                {item.mediaType.startsWith('image') ? (
                  <Image
                    src={item.url}
                    alt="Post media"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* NSFW Badge */}
        {post.isNsfw && (
          <div className="inline-block px-2 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded">
            NSFW
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                href={`/search?hashtag=${tag}`}
                className="text-primary hover:underline text-sm"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground border-t border-border pt-3">
          <span>{post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}</span>
          <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onLike?.(post.id)}
          >
            <Heart
              className={`w-4 h-4 ${post.liked ? 'fill-destructive text-destructive' : ''}`}
            />
            {post.liked ? 'Unlike' : 'Like'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleShowComments}
          >
            <MessageCircle className="w-4 h-4" />
            Comment
          </Button>
        </div>
      </CardContent>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border bg-muted/30">
          {/* Comments List */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {isLoadingComments ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment: any) => {
                const commentDisplayName =
                  comment.author?.profile?.displayName ||
                  [
                    comment.author?.profile?.firstName,
                    comment.author?.profile?.lastName,
                  ]
                    .filter(Boolean)
                    .join(' ') ||
                  comment.author?.username ||
                  'Unknown User';
                const commentAvatar = comment.author?.profile?.avatar || '';
                const commentInitial = commentDisplayName.charAt(0).toUpperCase() || '?';

                return (
                  <div key={comment.id} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden relative">
                      {commentAvatar ? (
                        <Image
                          src={commentAvatar}
                          alt={commentDisplayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {commentInitial}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {commentDisplayName}
                      </p>
                      <p className="text-sm text-foreground bg-muted rounded px-3 py-2">
                        {comment.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Comment Input */}
          <form
            onSubmit={handleSubmitComment}
            className="p-4 border-t border-border flex gap-2"
          >
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-background border-border"
            />
            <Button
              type="submit"
              size="sm"
              disabled={commentMutation.isPending || !commentText.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
