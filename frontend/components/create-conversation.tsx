'use client';

import { useState, useMemo } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Search, Loader, Clock } from 'lucide-react';
import { useMutationCreateConversation } from '@/lib/api/chat';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  location?: string;
}

interface RecentConversation {
  userId: string;
  userName: string;
  lastMessageTime?: string;
  avatar?: string;
}

interface CreateConversationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableUsers?: User[];
  recentConversations?: RecentConversation[];
  isLoadingUsers?: boolean;
}

export function CreateConversation({
  isOpen,
  onOpenChange,
  availableUsers = [],
  recentConversations = [],
  isLoadingUsers = false,
}: CreateConversationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const createConversationMutation = useMutationCreateConversation();

  // Filter users by search query
  const filteredUsers = useMemo(
    () =>
      availableUsers.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      ),
    [availableUsers, searchQuery]
  );

  // Show recent conversations if no search query
  const displayedUsers = searchQuery ? filteredUsers : [];
  const displayRecent = !searchQuery && recentConversations.length > 0;

  const handleStartConversation = async (userId: string) => {
    createConversationMutation.mutate(userId, {
      onSuccess: (conversation) => {
        onOpenChange(false);
        router.push(`/dashboard/messages/${conversation.id}`);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>Select a user to message</DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative px-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="pl-9"
          />
        </div>

        {/* Users List */}
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : displayRecent ? (
          <ScrollArea className="flex-1">
            <div className="space-y-0 px-1">
              {/* Recent Conversations */}
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Recent</p>
              </div>
              {recentConversations.map((conv, index) => (
                <div key={`${conv.userId}-${index}`}>
                  <button
                    onClick={() => handleStartConversation(conv.userId)}
                    className="w-full p-3 hover:bg-muted transition-colors text-left"
                    disabled={createConversationMutation.isPending}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.avatar} alt={conv.userName} />
                        <AvatarFallback>{conv.userName.split(' ')[0][0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{conv.userName}</p>
                        {conv.lastMessageTime && (
                          <p className="text-xs text-muted-foreground">{conv.lastMessageTime}</p>
                        )}
                      </div>

                      <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                  {index < recentConversations.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : searchQuery && displayedUsers.length === 0 ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-0 px-1">
              {/* Search Results */}
              {displayedUsers.map((user, index) => (
                <div key={user.id}>
                  <button
                    onClick={() => handleStartConversation(user.id)}
                    className="w-full p-3 hover:bg-muted transition-colors text-left"
                    disabled={createConversationMutation.isPending}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.profilePhoto}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.location && (
                          <p className="text-xs text-muted-foreground truncate">{user.location}</p>
                        )}
                      </div>

                      {createConversationMutation.isPending ? (
                        <Loader className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  {index < displayedUsers.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Button to open create conversation dialog
 */
export function CreateConversationButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="w-full gap-2">
      <MessageCircle className="w-4 h-4" />
      New Message
    </Button>
  );
}
