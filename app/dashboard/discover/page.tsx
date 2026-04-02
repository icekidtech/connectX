'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DiscoverCard } from '@/components/discover-card';
import { PreferenceEditor } from '@/components/preference-editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInfiniteQueryRecommendations, useMutationLikeUser } from '@/lib/api/matching';
import type { RecommendedUser as ApiRecommendedUser } from '@/lib/api/matching';
import { useIntersection } from '@/components/intersection-observer';
import { useToast } from '@/hooks/use-toast';

interface RecommendedUser {
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

function normalizeRecommendedUser(user: ApiRecommendedUser): RecommendedUser {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.displayName ||
    'Unknown User';

  const interestsFromCommon = Array.isArray(user.commonInterests)
    ? user.commonInterests.map((name: string, index: number) => ({
        id: `${user.id}-interest-${index}`,
        name,
      }))
    : [];

  const interests = Array.isArray(user.interests) && user.interests.length > 0
    ? user.interests
    : interestsFromCommon;

  const lookingFor = Array.isArray(user.lookingFor)
    ? user.lookingFor
    : Array.isArray(user.preferences?.lookingFor)
      ? user.preferences.lookingFor
      : [];

  const location =
    typeof user.location === 'string'
      ? user.location
      : user.location && typeof user.location === 'object'
        ? `${user.location.latitude}, ${user.location.longitude}`
        : 'Unknown location';

  return {
    id: user.id,
    displayName,
    avatar: user.avatar || user.profilePhotoUrl || user.profilePhoto || '',
    age: Number(user.age) || 0,
    location,
    bio: user.bio || '',
    lookingFor,
    interests,
    compatibilityScore: Number(user.compatibilityScore) || 0,
  };
}

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState<RecommendedUser | null>(null);
  const [filters, setFilters] = useState({});
  const { toast } = useToast();

  // Fetch recommendations with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQueryRecommendations(filters, 20);

  // Like mutation
  const likeMutation = useMutationLikeUser();

  // Intersection observer for loading next page
  const nextPageRef = useIntersection(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  );

  // Flatten all pages into single array
  const allUsers = (data?.pages.flatMap((page) => page.data ?? []) || []).map(
    (user) => normalizeRecommendedUser(user),
  );
  const currentUser = allUsers[currentIndex];

  const handleLike = (userId: string) => {
    likeMutation.mutate(userId, {
      onSuccess: () => {
        if (currentIndex < allUsers.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else if (hasNextPage) {
          fetchNextPage();
        } else {
          toast({
            title: 'No More Recommendations',
            description: 'Check back later for new matches!',
          });
        }
        setSelectedUser(null);
      },
      onError: (error: any) => {
        toast({
          title: 'Could not like user',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handlePass = (userId: string) => {
    if (currentIndex < allUsers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (hasNextPage) {
      fetchNextPage();
    }
    setSelectedUser(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-lg">Loading recommendations...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-lg text-destructive mb-4">Failed to load recommendations</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (allUsers.length === 0) {
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover</h1>
            <p className="text-muted-foreground">
              {allUsers.length > 0 ? `${currentIndex + 1} of ${allUsers.length} recommendations` : 'Finding matches...'}
            </p>
          </div>
        </div>

        {/* Preference Editor */}
        <div className="mb-8">
          <PreferenceEditor onSave={(newFilters) => setFilters(newFilters)} />
        </div>

        {currentUser && (
          <DiscoverCard
            user={currentUser}
            onLike={handleLike}
            onPass={handlePass}
            onShowInfo={setSelectedUser}
          />
        )}

        {/* Next page trigger */}
        <div ref={nextPageRef} className="mt-8" />

        {currentIndex >= allUsers.length - 3 && hasNextPage && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Loading more recommendations...</p>
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
