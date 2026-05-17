'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdvancedChat } from '@/components/advanced-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Info } from 'lucide-react';

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    profile: {
      displayName: string;
      avatar: string;
    };
  }>;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

    // Load conversation
    const loadConversation = async () => {
      try {
        const response = await fetch(`/api/chat/conversations/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setConversation(data);
      } catch (error) {
        console.error('[v0] Failed to load conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-border max-w-sm">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">Conversation not found</p>
            <Button onClick={() => router.back()} variant="outline" className="border-primary/50">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the other participant
  const otherParticipant =
    conversation.participants.find((p) => p.id !== currentUserId) || conversation.participants[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-4xl mx-auto py-4 px-4 h-screen flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{otherParticipant.profile.displayName}</h1>
          <Button variant="ghost" size="sm" className="ml-auto">
            <Info className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat Component */}
        <div className="flex-1 min-h-0">
          <AdvancedChat
            conversationId={conversationId}
            currentUserId={currentUserId}
            otherUserName={otherParticipant.profile.displayName}
            otherUserAvatar={otherParticipant.profile.avatar}
          />
        </div>
      </div>
    </div>
  );
}
