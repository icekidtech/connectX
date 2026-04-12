'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  MessageCircle,
  CheckCircle2,
  Clock,
  Bell,
  Mail,
  Search,
  Trash2,
  MoreVertical,
  ArrowRight,
  User,
  Flame,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'match' | 'message' | 'like' | 'comment' | 'verification' | 'system';
  title: string;
  message: string;
  actor?: {
    id: string;
    name: string;
    avatar: string;
  };
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match!',
    message: 'You matched with Sarah! Start a conversation now.',
    actor: {
      id: 'user1',
      name: 'Sarah Lee',
      avatar: 'https://avatar.example.com/sarah.jpg',
    },
    read: false,
    createdAt: new Date(Date.now() - 3600000),
    actionUrl: '/dashboard/messages/conv1',
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Hey! How are you doing?',
    actor: {
      id: 'user2',
      name: 'Alex Johnson',
      avatar: 'https://avatar.example.com/alex.jpg',
    },
    read: false,
    createdAt: new Date(Date.now() - 7200000),
    actionUrl: '/dashboard/messages/conv2',
  },
  {
    id: '3',
    type: 'like',
    title: 'Someone Liked You!',
    message: 'Jessica loved your recent post.',
    actor: {
      id: 'user3',
      name: 'Jessica Martinez',
      avatar: 'https://avatar.example.com/jessica.jpg',
    },
    read: true,
    createdAt: new Date(Date.now() - 86400000),
    actionUrl: '/dashboard/profile/user3',
  },
  {
    id: '4',
    type: 'verification',
    title: 'Verification Complete',
    message: 'Your profile verification has been approved.',
    read: true,
    createdAt: new Date(Date.now() - 172800000),
  },
];

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      match: <Flame className="w-4 h-4 text-warm-accent" />,
      message: <MessageCircle className="w-4 h-4 text-accent" />,
      like: <Heart className="w-4 h-4 text-warm-accent" />,
      comment: <MessageCircle className="w-4 h-4 text-accent" />,
      verification: <CheckCircle2 className="w-4 h-4 text-success" />,
      system: <Bell className="w-4 h-4 text-muted-foreground" />,
    };
    return icons[type] || icons.system;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-black text-warm-accent">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-gradient-to-r from-warm-accent to-accent text-white font-bold animate-spring-bounce">
              🔥 {unreadCount} Unread
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground font-medium">
          Stay updated on matches, messages, and platform activities
        </p>
      </div>

      {/* Notification Settings */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-warm-accent/30 hover:bg-warm-accent/10 hover:scale-105 transition-bounce"
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-warm-accent/30"
          />
        </div>

        {/* All Notifications */}
        <TabsContent value="all">
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-bounce cursor-pointer ${
                  !notification.read
                    ? 'bg-gradient-to-r from-warm-accent/15 to-accent/10 border-warm-accent/40 shadow-md shadow-warm/20 hover:shadow-lg hover:shadow-warm/30'
                    : 'bg-card border-border/50 hover:border-warm-accent/30 hover:bg-card/80'
                }`}
                style={{ animation: `fade-in-up 0.5s ease-out ${index * 50}ms both` }}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {notification.actor ? (
                    <Avatar className="ring-2 ring-warm-accent/30">
                      <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
                      <AvatarFallback className="bg-gradient-to-br from-warm-accent to-accent text-white font-bold">
                        {notification.actor.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-accent/30 to-accent/20 flex items-center justify-center ring-1 ring-warm-accent/20">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-base text-warm-accent">{notification.title}</h3>
                      {!notification.read && (
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-warm-accent to-accent ml-2 mt-1 flex-shrink-0 animate-spring-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((Date.now() - notification.createdAt.getTime()) / 60000)} minutes
                      ago
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="flex-shrink-0 hover:bg-warm-accent/10"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                        Mark as read
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteNotification(notification.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Unread Notifications */}
        <TabsContent value="unread">
          <div className="space-y-3">
            {filteredNotifications
              .filter((n) => !n.read)
              .map((notification, index) => (
                <div
                  key={notification.id}
                  className="p-4 rounded-lg border border-warm-accent/40 bg-gradient-to-r from-warm-accent/15 to-accent/10 cursor-pointer hover:shadow-lg hover:shadow-warm/30 transition-bounce"
                  style={{ animation: `fade-in-up 0.5s ease-out ${index * 50}ms both` }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    {notification.actor ? (
                      <Avatar className="ring-2 ring-warm-accent/30">
                        <AvatarImage
                          src={notification.actor.avatar}
                          alt={notification.actor.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-warm-accent to-accent text-white font-bold">
                          {notification.actor.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-accent/30 to-accent/20 flex items-center justify-center ring-1 ring-warm-accent/20">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-warm-accent">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((Date.now() - notification.createdAt.getTime()) / 60000)}{' '}
                        minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches">
          <div className="space-y-3">
            {filteredNotifications
              .filter((n) => n.type === 'match' || n.type === 'like')
              .map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border border-border cursor-pointer transition-all ${
                    !notification.read
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-card hover:bg-card/80'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    {notification.actor && (
                      <Avatar>
                        <AvatarImage
                          src={notification.actor.avatar}
                          alt={notification.actor.name}
                        />
                        <AvatarFallback>{notification.actor.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((Date.now() - notification.createdAt.getTime()) / 60000)}{' '}
                        minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <div className="space-y-2">
            {filteredNotifications
              .filter((n) => n.type === 'message')
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border border-border cursor-pointer transition-all ${
                    !notification.read
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-card hover:bg-card/80'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    {notification.actor && (
                      <Avatar>
                        <AvatarImage
                          src={notification.actor.avatar}
                          alt={notification.actor.name}
                        />
                        <AvatarFallback>{notification.actor.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((Date.now() - notification.createdAt.getTime()) / 60000)}{' '}
                        minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
