'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio } from 'lucide-react';
import { LiveStreams } from '@/components/live-streams';
import Link from 'next/link';

export default function StreamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live Streams</h1>
            <p className="text-muted-foreground">
              Connect with people in real-time through live video streaming
            </p>
          </div>
          <Link href="/dashboard/streams/go-live">
            <Button className="bg-accent hover:bg-accent/90 gap-2">
              <Radio className="w-4 h-4" />
              Go Live
            </Button>
          </Link>
        </div>

        {/* Live Streams */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Now Streaming</h2>
          <LiveStreams />
        </div>

        {/* Tips Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-accent" />
              Tips for Going Live
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-foreground mb-2">Good Lighting</p>
              <p className="text-sm text-muted-foreground">
                Make sure you're well lit for viewers. Natural light works great!
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Clear Audio</p>
              <p className="text-sm text-muted-foreground">
                Test your mic before going live to ensure good sound quality.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Interesting Topic</p>
              <p className="text-sm text-muted-foreground">
                Let people know what they'll see. A good title helps attract viewers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
