'use client';

import { useParams } from 'next/navigation';
import { StreamViewer } from '@/components/stream-viewer';

export default function StreamViewerPage() {
  const params = useParams();
  const streamId = params.id as string;

  // Mock stream data - in production, this would come from the API
  const mockStreamData = {
    streamId: streamId,
    streamerName: 'Sarah Lee',
    streamerAvatar: 'https://avatar.example.com/sarah.jpg',
    title: 'Relaxing Evening Chat & Music',
    description: 'Join me for a relaxing evening! We\'ll chat, share music, and have a great time together. No ads, just genuine connection and good vibes.',
    viewerCount: 2847,
    duration: '2h 15m',
    tags: ['chat', 'music', 'relaxing', 'streaming'],
    isNsfw: false,
  };

  return <StreamViewer {...mockStreamData} />;
}
