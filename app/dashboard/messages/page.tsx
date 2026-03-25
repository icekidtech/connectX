'use client';

import { ConversationsList } from '@/components/conversations-list';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Stay connected with your matches. Real-time messaging with typing indicators and read receipts.
          </p>
        </div>

        <ConversationsList />
      </div>
    </div>
  );
}
