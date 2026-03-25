'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredConversations(
        conversations.filter((conv) =>
          conv.participants.some((p) =>
            p.profile.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        ),
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('[v0] Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Delete this conversation?')) return;

    try {
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (error) {
      console.error('[v0] Failed to delete conversation:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading conversations...</div>;
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
              No conversations match your search
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipants = conversation.participants.filter(
              (p) => p.id !== localStorage.getItem('userId'),
            );
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
          })
        )}
      </div>
    </div>
  );
}
