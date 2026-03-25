'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Users, Share2, Heart, Flag } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Stream {
  id: string;
  title: string;
  description?: string;
  broadcaster: {
    id: string;
    profile: {
      displayName: string;
      avatar: string;
    };
  };
  status: string;
  viewerCount: number;
  isNsfw: boolean;
  createdAt: string;
}

interface StreamViewer {
  id: string;
  viewer: {
    profile: {
      displayName: string;
    };
  };
}

export default function StreamViewerPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;

  const [stream, setStream] = useState<Stream | null>(null);
  const [viewers, setViewers] = useState<StreamViewer[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isViewing, setIsViewing] = useState(false);

  const fetchStream = useCallback(async () => {
    try {
      const response = await fetch(`/api/streams/${streamId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStream(data);
    } catch (error) {
      console.error('[v0] Failed to fetch stream:', error);
    }
  }, [streamId]);

  const fetchViewers = useCallback(async () => {
    try {
      const response = await fetch(`/api/streams/${streamId}/viewers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setViewers(data);
    } catch (error) {
      console.error('[v0] Failed to fetch viewers:', error);
    }
  }, [streamId]);

  useEffect(() => {
    fetchStream();
    fetchViewers();
    setLoading(false);

    // Join stream
    joinStream();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStream();
      fetchViewers();
    }, 10000);

    return () => {
      clearInterval(interval);
      leaveStream();
    };
  }, [streamId, fetchStream, fetchViewers]);

  const joinStream = async () => {
    try {
      await fetch(`/api/streams/${streamId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setIsViewing(true);
    } catch (error) {
      console.error('[v0] Failed to join stream:', error);
    }
  };

  const leaveStream = async () => {
    try {
      await fetch(`/api/streams/${streamId}/leave`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setIsViewing(false);
    } catch (error) {
      console.error('[v0] Failed to leave stream:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    // In a real app, this would send the comment to the WebSocket
    console.log('[v0] Comment:', comment);
    setComment('');
  };

  if (loading || !stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <Link href="/dashboard/streams" className="inline-flex items-center gap-2 mb-8 text-primary hover:text-primary/80 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Streams
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player & Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player Placeholder */}
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-muted-foreground">Stream video player</p>
                <Badge className="mt-4 bg-destructive">LIVE</Badge>
              </div>
            </div>

            {/* Stream Info */}
            <Card className="border-border">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {stream.title}
                    </h1>
                    {stream.isNsfw && (
                      <Badge variant="destructive" className="mb-4">
                        NSFW Content
                      </Badge>
                    )}
                    <p className="text-muted-foreground mb-4">{stream.description}</p>

                    {/* Broadcaster Info */}
                    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                        {stream.broadcaster.profile.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {stream.broadcaster.profile.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">Broadcaster</p>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Follow
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="border-border">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-border">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-border">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">
                      <span className="font-semibold">{stream.viewerCount}</span> watching
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages Area */}
                <div className="space-y-3 h-64 overflow-y-auto bg-card/50 rounded-lg p-4 border border-border">
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-semibold text-primary">User:</span>
                      <span className="text-foreground">Great stream!</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold text-accent">Viewer:</span>
                      <span className="text-foreground">Love this!</span>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <form onSubmit={handleComment} className="flex gap-2">
                  <Input
                    placeholder="Send a message..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-input border-border flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Viewers List */}
          <div>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Viewers ({viewers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {viewers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No viewers yet</p>
                  ) : (
                    viewers.map((viewer) => (
                      <div
                        key={viewer.id}
                        className="p-2 rounded-lg bg-card/50 border border-border"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {viewer.viewer.profile.displayName}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
