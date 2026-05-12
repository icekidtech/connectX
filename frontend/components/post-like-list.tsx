'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Loader } from 'lucide-react';
import Link from 'next/link';

interface Like {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    location?: string;
  };
  createdAt: string;
}

interface PostLikeListProps {
  postId: string;
  likes: Like[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

export function PostLikeList({
  postId,
  likes,
  isOpen,
  onOpenChange,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
}: PostLikeListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLikes = likes.filter((like) =>
    `${like.user.firstName} ${like.user.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[500px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive fill-current" />
            <div>
              <DialogTitle>People who liked this</DialogTitle>
              <DialogDescription>{likes.length} likes</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative px-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Likes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredLikes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'No users found' : 'No likes yet'}
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-3 p-4">
              {filteredLikes.map((like) => (
                <Link
                  key={like.id}
                  href={`/dashboard/profile/${like.user.id}`}
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={like.user.profilePhoto}
                        alt={`${like.user.firstName} ${like.user.lastName}`}
                      />
                      <AvatarFallback>
                        {like.user.firstName[0]}
                        {like.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {like.user.firstName} {like.user.lastName}
                      </p>
                      {like.user.location && (
                        <p className="text-xs text-muted-foreground truncate">
                          {like.user.location}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle follow action
                      }}
                    >
                      Follow
                    </Button>
                  </div>
                </Link>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLoadMore}
                    disabled={isFetchingMore}
                  >
                    {isFetchingMore ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
