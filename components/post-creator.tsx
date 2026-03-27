'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Send, X } from 'lucide-react';
import { useMutationCreatePost } from '@/lib/api/posts';
import { useToast } from '@/hooks/use-toast';

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const { toast } = useToast();

  const createPostMutation = useMutationCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hashtagArray = hashtags
      .split(' ')
      .filter((tag) => tag.trim().startsWith('#'))
      .map((tag) => tag.replace('#', ''));

    createPostMutation.mutate(
      {
        caption,
        hashtags: hashtagArray,
        isNsfw,
      },
      {
        onSuccess: () => {
          // Reset form
          setCaption('');
          setHashtags('');
          setIsNsfw(false);
          setIsOpen(false);

          // Notify parent
          onPostCreated?.();

          toast({
            title: 'Post created',
            description: 'Your post has been published!',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to create post',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <Card className="border-border mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">👤</div>
            <button
              onClick={() => setIsOpen(true)}
              className="flex-1 px-4 py-2 bg-muted rounded-full text-left text-muted-foreground hover:bg-muted/80 transition"
            >
              What's on your mind?
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border mb-6">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Create a Post</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">👤</div>
            <div className="flex-1">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind? Share your story, interests, or what you're looking for..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24 resize-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Add hashtags: #dating #adventure #music (optional)"
              className="bg-input border-border"
            />
            <p className="text-xs text-muted-foreground">Separate hashtags with spaces and start with #</p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNsfw}
                onChange={(e) => setIsNsfw(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-foreground">Mark as NSFW content</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="border-border text-foreground" disabled={createPostMutation.isPending}>
              <Image className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => setIsOpen(false)}
              disabled={createPostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={createPostMutation.isPending || !caption.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {createPostMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
