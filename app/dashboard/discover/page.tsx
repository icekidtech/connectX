'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DiscoverCard } from '@/components/discover-card';
import { PreferenceEditor } from '@/components/preference-editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DiscoverUser {
  id: string;
  displayName: string;
  avatar: string;
  age: number;
  location: string;
  bio: string;
  lookingFor: string[];
  interests: Array<{ id: string; name: string }>;
  compatibilityScore: number;
}

export default function DiscoverPage() {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DiscoverUser | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matching/recommendations?page=1&limit=20', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setUsers(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('[v0] Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleLike = async (userId: string) => {
    try {
      const response = await fetch(`/api/matching/${userId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      console.log('[v0] Like result:', result);

      if (currentIndex < users.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        fetchRecommendations();
      }
    } catch (error) {
      console.error('[v0] Failed to like user:', error);
    }
  };

  const handlePass = (userId: string) => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchRecommendations();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading recommendations...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Discover</h1>
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              No recommendations available at this time.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your preferences or check back later!
            </p>
            <Button onClick={fetchRecommendations}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover</h1>
            <p className="text-muted-foreground">
              {users.length > 0 ? `${currentIndex + 1} of ${users.length} matches` : 'Finding matches...'}
            </p>
          </div>
        </div>

        {/* Preference Editor */}
        <div className="mb-8">
          <PreferenceEditor onSave={() => fetchRecommendations()} />
        </div>

        {currentUser && (
          <DiscoverCard
            user={currentUser}
            onLike={handleLike}
            onPass={handlePass}
            onShowInfo={setSelectedUser}
          />
        )}

        {currentIndex >= users.length - 3 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Running out of recommendations!</p>
            <Button onClick={fetchRecommendations}>Load More</Button>
          </div>
        )}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser?.displayName}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Age & Location</p>
                <p>{selectedUser.age} years old, {selectedUser.location}</p>
              </div>

              {selectedUser.bio && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Bio</p>
                  <p>{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.lookingFor.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Looking For</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.lookingFor.map((type) => (
                      <span key={type} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.interests.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.interests.map((interest) => (
                      <span key={interest.id} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                        {interest.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handlePass(selectedUser.id);
                    setSelectedUser(null);
                  }}
                >
                  Pass
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleLike(selectedUser.id);
                    setSelectedUser(null);
                  }}
                >
                  Like
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
