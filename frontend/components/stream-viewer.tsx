'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Share2,
  MessageCircle,
  MoreVertical,
  Send,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LiveComment {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: Date;
  liked?: boolean;
}

interface StreamViewerProps {
  streamId: string;
  streamerName: string;
  streamerAvatar: string;
  title: string;
  description: string;
  viewerCount: number;
  duration: string;
  tags: string[];
  isNsfw: boolean;
}

export function StreamViewer({
  streamId,
  streamerName,
  streamerAvatar,
  title,
  description,
  viewerCount,
  duration,
  tags,
  isNsfw,
}: StreamViewerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: '1',
      author: 'Alex_123',
      avatar: 'https://avatar.example.com/alex.jpg',
      message: 'Great stream! Love the energy 🔥',
      timestamp: new Date(Date.now() - 2000),
      liked: false,
    },
    {
      id: '2',
      author: 'Jordan_K',
      avatar: 'https://avatar.example.com/jordan.jpg',
      message: 'This is amazing content!',
      timestamp: new Date(Date.now() - 5000),
      liked: false,
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: String(comments.length + 1),
          author: 'You',
          avatar: 'https://avatar.example.com/you.jpg',
          message: newComment,
          timestamp: new Date(),
          liked: false,
        },
      ]);
      setNewComment('');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
              {/* Stream placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                <div className="text-center">
                  <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Stream Video Player</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (Integrated with Agora/Daily.co)
                  </p>
                </div>

                {/* Live badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    LIVE
                  </Badge>
                </div>

                {/* Viewer count */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="gap-2">
                    <Users className="w-4 h-4" />
                    {viewerCount.toLocaleString()}
                  </Badge>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{title}</h1>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={streamerAvatar} alt={streamerName} />
                          <AvatarFallback>{streamerName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{streamerName}</p>
                          <p className="text-xs text-muted-foreground">Online for {duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Report</DropdownMenuItem>
                      <DropdownMenuItem>Block User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-muted-foreground mb-4">{description}</p>

                {/* Tags and NSFW indicator */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {isNsfw && (
                    <Badge variant="destructive" className="rounded-full">
                      NSFW
                    </Badge>
                  )}
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    variant={liked ? 'default' : 'outline'}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
                    {liked ? 'Liked' : 'Like'}
                  </Button>
                  <Button className="flex-1 gap-2" variant="outline">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Live Chat */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card h-full flex flex-col max-h-[calc(100vh-100px)]">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                {/* Comments area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarImage src={comment.avatar} alt={comment.author} />
                            <AvatarFallback>
                              {comment.author.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-foreground">
                              {comment.author}
                            </p>
                            <p className="text-xs text-muted-foreground break-words">
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                </ScrollArea>

                {/* Comment input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      className="text-sm"
                    />
                    <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
