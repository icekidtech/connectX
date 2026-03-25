'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Send, Paperclip, MoreVertical, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  messageType: 'text' | 'media';
  createdAt: string;
  isRead?: boolean;
  readAt?: string;
  sender?: {
    profile: {
      displayName: string;
      avatar: string;
    };
  };
}

interface AdvancedChatProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export function AdvancedChat({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserAvatar,
}: AdvancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/chat/conversations/${conversationId}/messages?page=1&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await response.json();
        setMessages(data);

        // Mark as read
        await fetch(`/api/chat/conversations/${conversationId}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } catch (error) {
        console.error('[v0] Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    // Emit typing indicator
    if (!isTyping) {
      setIsTyping(true);
      // In a real app, emit WebSocket event here
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // In a real app, emit WebSocket event here
    }, 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            content: messageText,
            messageType: 'text',
          }),
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageText('');
        setIsTyping(false);

        // In a real app, emit WebSocket event for message sent
      }
    } catch (error) {
      console.error('[v0] Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendMedia = async (file: File) => {
    // In a real app, upload to storage first
    console.log('[v0] Send media:', file);
  };

  if (loading) {
    return (
      <Card className="h-full border-border flex flex-col">
        <CardHeader className="border-b border-border">
          <div className="text-center">Loading messages...</div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden relative">
              {otherUserAvatar ? (
                <Image
                  src={otherUserAvatar}
                  alt={otherUserName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {otherUserName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{otherUserName}</p>
              <p className="text-xs text-muted-foreground">
                {otherUserTyping ? 'typing...' : 'Active'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-xs text-muted-foreground">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar =
              index === 0 ||
              messages[index - 1].senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden relative">
                    {otherUserAvatar ? (
                      <Image
                        src={otherUserAvatar}
                        alt={otherUserName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                        {otherUserName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-8" />}

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.mediaUrl ? (
                      <div className="relative w-48 h-48 rounded overflow-hidden">
                        <Image
                          src={message.mediaUrl}
                          alt="Message media"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-sm break-words">{message.content}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {isOwn && (
                      <>
                        {message.isRead ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Check className="w-3 h-3 text-muted-foreground" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {otherUserTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex items-center gap-1 bg-muted px-4 py-2 rounded-lg">
              <span className="text-xs text-muted-foreground">{otherUserName} is typing</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-border p-4 flex gap-2"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById(`media-${conversationId}`)?.click()}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <input
          id={`media-${conversationId}`}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleSendMedia(e.target.files[0])}
        />

        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={handleTyping}
          className="flex-1 bg-background border-border"
          disabled={sending}
        />

        <Button
          type="submit"
          size="sm"
          disabled={!messageText.trim() || sending}
          className="bg-primary hover:bg-primary/90"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </Card>
  );
}
