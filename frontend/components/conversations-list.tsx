'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useInfiniteQueryConversations, useMutationArchiveConversation } from '@/lib/api/chat';
import { useAuth } from '@/hooks/use-auth-token';
import { useIntersection } from './intersection-observer';
import { useToast } from '@/hooks/use-toast';

interface ConversationPreview {
  id: string;
  participants: Array<{
    id: string;
    profile: {
      displayName: string;
      avatar: string;
    };
  }>;
  messages: Array<{
    content: string;
    senderId: string;
    createdAt: string;
  }>;
  updatedAt: string;
}

export function ConversationsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQueryConversations(20);

  const archiveMutation = useMutationArchiveConversation();

  // Intersection observer for pagination
  const nextPageRef = useIntersection(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  );

  // Flatten all pages
  const conversations = data?.pages.flatMap((page) => page.data) || [];

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) =>
      p.profile.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleDeleteConversation = (conversationId: string) => {
    if (!confirm('Delete this conversation?')) return;

    archiveMutation.mutate(conversationId, {
      onSuccess: () => {
        toast({
          title: 'Conversation archived',
          description: 'The conversation has been removed from your list.',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to delete conversation',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading conversations...</div>;
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6 text-center text-destructive">
          Failed to load conversations. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No conversations yet. Start chatting with someone!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conversations */}
      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground text-sm">
              {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredConversations.map((conversation) => {
              const otherParticipants = conversation.participants.filter((p) => p.id !== user?.id);
              const lastMessage = conversation.messages[conversation.messages.length - 1];

              return (
                <Link key={conversation.id} href={`/dashboard/messages/${conversation.id}`}>
                  <Card className="hover:bg-accent/5 cursor-pointer transition">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">
                            {otherParticipants.map((p) => p.profile.displayName).join(', ')}
                          </h3>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.content}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conversation.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {/* Next page trigger */}
            <div ref={nextPageRef} className="mt-4" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
