'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users } from 'lucide-react';
import Link from 'next/link';

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

export function LiveStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStreams();
  }, []);

  const fetchLiveStreams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/streams/live?page=1&limit=20', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStreams(data);
    } catch (error) {
      console.error('[v0] Failed to fetch streams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading streams...</div>;
  }

  if (streams.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No live streams at the moment. Check back soon!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {streams.map((stream) => (
        <Link key={stream.id} href={`/dashboard/streams/${stream.id}`}>
          <Card className="h-full hover:shadow-lg transition cursor-pointer overflow-hidden">
            {/* Stream Thumbnail */}
            <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center group">
              <Play className="w-12 h-12 text-primary opacity-75 group-hover:opacity-100 transition" />
              {stream.isNsfw && (
                <Badge className="absolute top-2 right-2 bg-destructive">NSFW</Badge>
              )}
              <Badge className="absolute top-2 left-2 bg-destructive/80">LIVE</Badge>
            </div>

            {/* Stream Info */}
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-lg truncate">{stream.title}</h3>
            </CardHeader>

            {/* Stream Meta */}
            <CardContent className="space-y-3">
              {stream.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {stream.description}
                </p>
              )}

              {/* Broadcaster */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-semibold">
                  {stream.broadcaster.profile.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">
                  {stream.broadcaster.profile.displayName}
                </span>
              </div>

              {/* Viewer Count */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{stream.viewerCount} watching</span>
              </div>

              <Button className="w-full gap-2">
                <Play className="w-4 h-4" />
                Watch Stream
              </Button>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
