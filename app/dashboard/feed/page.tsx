'use client';

import { Suspense } from 'react';
import { PostCreator } from '@/components/post-creator';
import { Feed } from '@/components/feed';

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-8">Feed</h1>

      {/* Post Creator */}
      <div className="mb-8">
        <PostCreator />
      </div>

      {/* Feed */}
      <Suspense fallback={<div>Loading feed...</div>}>
        <Feed />
      </Suspense>
    </div>
  );
}
