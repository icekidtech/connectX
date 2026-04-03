'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Send, X } from 'lucide-react';
import { useMutationCreatePost } from '@/lib/api/posts';
import { apiJson } from '@/lib/fetch-proxy';
import { useToast } from '@/hooks/use-toast';

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const MAX_PHOTOS = 4;

  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const createPostMutation = useMutationCreatePost();

  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (incomingFiles.length === 0) {
      return;
    }

    const imageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length !== incomingFiles.length) {
      toast({
        title: 'Some files were skipped',
        description: 'Only image files are supported.',
        variant: 'destructive',
      });
    }

    const remainingSlots = Math.max(0, MAX_PHOTOS - selectedPhotos.length);
    if (remainingSlots === 0) {
      toast({
        title: 'Photo limit reached',
        description: `You can attach up to ${MAX_PHOTOS} photos per post.`,
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    const filesToAdd = imageFiles.slice(0, remainingSlots);
    if (imageFiles.length > remainingSlots) {
      toast({
        title: 'Photo limit reached',
        description: `Only ${remainingSlots} more photo${remainingSlots > 1 ? 's were' : ' was'} added.`,
      });
    }

    setSelectedPhotos((prev) => [...prev, ...filesToAdd]);
    e.target.value = '';
  };

  const handleRemoveSelectedPhoto = (indexToRemove: number) => {
    setSelectedPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const uploadSelectedPhotos = async () => {
    if (selectedPhotos.length === 0) {
      return [] as string[];
    }

    const uploads = selectedPhotos.map(async (photo) => {
      const formData = new FormData();
      formData.append('file', photo);

      const uploadResponse = await apiJson<{ url: string }>('/upload/image', {
        method: 'POST',
        body: formData,
      });

      return uploadResponse.url;
    });

    return Promise.all(uploads);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hashtagArray = hashtags
      .split(' ')
      .filter((tag) => tag.trim().startsWith('#'))
      .map((tag) => tag.replace('#', ''));

    let uploadedMediaUrls: string[] = [];

    try {
      setIsUploadingPhotos(true);
      uploadedMediaUrls = await uploadSelectedPhotos();
    } catch (error: any) {
      setIsUploadingPhotos(false);
      toast({
        title: 'Failed to upload photos',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPhotos(false);

    createPostMutation.mutate(
      {
        caption,
        hashtags: hashtagArray,
        isNsfw,
        visibility: 'public',
        mediaUrls: uploadedMediaUrls,
      },
      {
        onSuccess: () => {
          // Reset form
          setCaption('');
          setHashtags('');
          setIsNsfw(false);
          setSelectedPhotos([]);
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handlePhotoSelection}
            className="hidden"
          />

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

          {selectedPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Selected photos ({selectedPhotos.length}/{MAX_PHOTOS})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPhotos.map((photo, index) => (
                  <div
                    key={`${photo.name}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1"
                  >
                    <span className="max-w-40 truncate text-xs text-foreground">{photo.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedPhoto(index)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${photo.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
              onClick={handleAddPhotosClick}
              disabled={createPostMutation.isPending || isUploadingPhotos}
            >
              <Image className="h-4 w-4 mr-2" />
              {selectedPhotos.length > 0 ? `Add More Photos (${selectedPhotos.length})` : 'Add Photos'}
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => setIsOpen(false)}
              disabled={createPostMutation.isPending || isUploadingPhotos}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={createPostMutation.isPending || isUploadingPhotos || !caption.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {isUploadingPhotos ? 'Uploading photos...' : createPostMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
