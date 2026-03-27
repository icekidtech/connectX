'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Send, Paperclip, MoreVertical, Check, CheckCheck, Wifi, WifiOff } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth-token';
import { useWebSocket } from '@/hooks/use-websocket';
import {
  useInfiniteQueryConversationMessages,
  useMutationSendMessage,
  useMutationMarkConversationRead,
  Message,
} from '@/lib/api/chat';
import { useQueryClient } from '@tanstack/react-query';

interface AdvancedChatProps {
  conversationId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export function AdvancedChat({
  conversationId,
  otherUserName,
  otherUserAvatar,
}: AdvancedChatProps) {
  const { user } = useAuth();
  const { socket, status: wsStatus } = useWebSocket();
  const queryClient = useQueryClient();
  
  const [messageText, setMessageText] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  if (!user) {
    return <div className="p-4 text-muted-foreground">Loading...</div>;
  }

  // Load infinite messages
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQueryConversationMessages(conversationId, 50);

  // Send message mutation
  const sendMessageMutation = useMutationSendMessage(conversationId);

  // Mark as read
  const markReadMutation = useMutationMarkConversationRead(conversationId);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [data, scrollToBottom]);

  // Mark conversation as read on mount
  useEffect(() => {
    markReadMutation.mutate();
  }, [conversationId]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages from other user
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        // Add message to cache
        queryClient.setInfiniteQueryData(
          ['chat', 'messages', conversationId],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) => {
                if (index === oldData.pages.length - 1) {
                  return {
                    ...page,
                    data: [...page.data, message],
                  };
                }
                return page;
              }),
            };
          }
        );
        // Scroll to new message
        setTimeout(scrollToBottom, 100);
      }
    };

    // Listen for typing indicator
    const handleUserTyping = (data: { conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        setOtherUserTyping(data.isTyping);
      }
    };

    // Listen for message read receipts
    const handleMessageRead = (data: { messageId: string; readAt: string }) => {
      queryClient.setInfiniteQueryData(
        ['chat', 'messages', conversationId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((msg: Message) =>
                msg.id === data.messageId
                  ? { ...msg, isRead: true, readAt: data.readAt }
                  : msg
              ),
            })),
          };
        }
      );
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('messageRead', handleMessageRead);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, conversationId, queryClient, scrollToBottom]);

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    // Emit typing indicator via WebSocket
    if (socket && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId, isTyping: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('typing', { conversationId, isTyping: false });
      }
    }, 3000);
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const content = messageText;
    setMessageText('');
    setIsTyping(false);

    if (socket) {
      socket.emit('typing', { conversationId, isTyping: false });
    }

    sendMessageMutation.mutate(content);
  };

  const handleSendMedia = async (file: File) => {
    // TODO: Implement media upload
    console.log('Send media:', file);
  };

  // Flatten all messages from pages
  const messages =
    data?.pages.flatMap((page) => page.data).reverse() ?? [];

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
              <div className="flex items-center gap-1">
                {wsStatus === 'connected' ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-muted-foreground">
                      {otherUserTyping ? 'typing...' : 'Active'}
                    </p>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-destructive" />
                    <p className="text-xs text-destructive">Reconnecting...</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-xs text-muted-foreground">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load earlier messages'}
                </Button>
              </div>
            )}

            {messages.map((message, index) => {
              const isOwn = message.senderId === user.id;
              const showAvatar =
                index === messages.length - 1 ||
                messages[index + 1].senderId !== message.senderId;

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
                      <p className="text-sm break-words">{message.content}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {isOwn &&
                        (!message.id.startsWith('temp-') ? (
                          message.isRead ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3 text-muted-foreground" />
                          )
                        ) : (
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
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

        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
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
          disabled={sendMessageMutation.isPending}
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
          disabled={sendMessageMutation.isPending || wsStatus !== 'connected'}
        />

        <Button
          type="submit"
          size="sm"
          disabled={
            !messageText.trim() ||
            sendMessageMutation.isPending ||
            wsStatus !== 'connected'
          }
          className="bg-primary hover:bg-primary/90"
        >
          {sendMessageMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </Card>
  );
}
