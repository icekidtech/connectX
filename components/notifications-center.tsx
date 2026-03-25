'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
      match: <Heart className="w-4 h-4 text-red-500" />,
      message: <MessageCircle className="w-4 h-4 text-blue-500" />,
      like: <Heart className="w-4 h-4 text-pink-500" />,
      comment: <MessageCircle className="w-4 h-4 text-purple-500" />,
      verification: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      system: <Bell className="w-4 h-4 text-gray-500" />,
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Stay updated on matches, messages, and platform activities
          </p>
        </div>

        {/* Notification Settings */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
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
              className="pl-10"
            />
          </div>

          {/* All Notifications */}
          <TabsContent value="all">
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
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
                    {notification.actor ? (
                      <Avatar>
                        <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
                        <AvatarFallback>{notification.actor.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-accent ml-2 mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((Date.now() - notification.createdAt.getTime()) / 60000)} minutes
                        ago
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                          Mark as read
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600"
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
            <div className="space-y-2">
              {filteredNotifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 rounded-lg border border-accent/30 bg-accent/10 cursor-pointer hover:bg-accent/20 transition-all"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      {notification.actor ? (
                        <Avatar>
                          <AvatarImage
                            src={notification.actor.avatar}
                            alt={notification.actor.name}
                          />
                          <AvatarFallback>{notification.actor.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
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

          {/* Matches Tab */}
          <TabsContent value="matches">
            <div className="space-y-2">
              {filteredNotifications
                .filter((n) => n.type === 'match' || n.type === 'like')
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
    </div>
  );
}
