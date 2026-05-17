'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  messageType: 'text' | 'media';
  createdAt: string;
}

interface ChatParticipant {
  id: string;
  profile: {
    displayName: string;
    avatar: string;
  };
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  participants: ChatParticipant[];
  initialMessages?: Message[];
}

export function ChatInterface({
  conversationId,
  currentUserId,
  participants,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('connect', () => {
      console.log('[v0] WebSocket connected');
      setIsConnected(true);
      newSocket.emit('joinConversation', {
        conversationId,
        userId: currentUserId,
      });
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        if (data.isTyping) {
          updated.add(data.userId);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    });

    newSocket.on('messageRead', (data: { messageId: string; readBy: string }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, readBy: data.readBy } : msg))
      );
    });

    newSocket.on('userOnline', (data: { userId: string; status: string }) => {
      console.log('[v0] User online status:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('[v0] WebSocket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveConversation', { conversationId, userId: currentUserId });
      newSocket.disconnect();
    };
  }, [conversationId, currentUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !socket) return;

    socket.emit('message', {
      conversationId,
      senderId: currentUserId,
      content: inputValue,
    });

    setInputValue('');
    setIsTyping(false);
  }, [inputValue, socket, conversationId, currentUserId]);

  const handleTyping = useCallback(() => {
    if (!socket || !isConnected) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        conversationId,
        userId: currentUserId,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId,
        userId: currentUserId,
        isTyping: false,
      });
      setIsTyping(false);
    }, 3000);
  }, [socket, isConnected, isTyping, conversationId, currentUserId]);

  const otherParticipants = participants.filter((p) => p.id !== currentUserId);

  return (
    <Card className="h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          {otherParticipants.length === 1 && (
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                {otherParticipants[0].profile.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">{otherParticipants[0].profile.displayName}</h3>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </>
          )}
          {otherParticipants.length > 1 && (
            <div>
              <h3 className="font-semibold">Group Chat ({otherParticipants.length} members)</h3>
              <p className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.senderId === currentUserId
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-muted-foreground rounded-bl-none'
              }`}
            >
              {message.mediaUrl && message.messageType === 'media' && (
                <div className="mb-2">
                  <Image
                    src={message.mediaUrl}
                    alt="Message media"
                    width={200}
                    height={200}
                    className="rounded max-w-xs"
                  />
                </div>
              )}
              <p className="text-sm break-words">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {typingUsers.size > 0 && (
          <div className="flex gap-2 items-center text-muted-foreground text-sm">
            <span>
              {Array.from(typingUsers)
                .map((id) => participants.find((p) => p.id === id)?.profile.displayName)
                .join(', ')}{' '}
              is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button variant="ghost" size="icon">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Smile className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
