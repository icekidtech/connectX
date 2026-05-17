'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ChevronRight, Loader } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Match {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    age?: number;
    location?: string;
    compatibilityScore?: number;
  };
  mutualLikeDate?: string;
}

interface MatchesListProps {
  matches: Match[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStartConversation: (userId: string) => void;
  isLoading?: boolean;
  isFetchingMore?: boolean;
}

export function MatchesList({
  matches,
  isOpen,
  onOpenChange,
  onStartConversation,
  isLoading = false,
  isFetchingMore = false,
}: MatchesListProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Your Matches</DialogTitle>
          <DialogDescription>
            {matches.length} mutual match{matches.length !== 1 ? 'es' : ''}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Matches Grid */}
            <div className="grid grid-cols-2 gap-4 overflow-y-auto flex-1 px-4">
              {matches.map((match, index) => (
                <Card
                  key={match.id}
                  className="overflow-hidden cursor-pointer hover:shadow-warm-lg hover:scale-105 transition-bounce hover:animate-card-hover"
                  style={{ animation: `stagger-item 0.5s ease-out ${index * 50}ms both` }}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="relative w-full h-40 bg-muted">
                    {match.user.profilePhoto ? (
                      <Image
                        src={match.user.profilePhoto}
                        alt={`${match.user.firstName} ${match.user.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-bold">
                        {match.user.firstName[0]}
                        {match.user.lastName[0]}
                      </div>
                    )}

                    {match.user.compatibilityScore && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-warm-accent to-accent text-white font-bold shadow-md shadow-warm/40">
                          🔥 {match.user.compatibilityScore}%
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <p className="font-bold text-base text-warm-accent">
                      {match.user.firstName} {match.user.lastName}
                    </p>
                    {match.user.age && (
                      <p className="text-xs text-muted-foreground font-medium">
                        {match.user.age} years old
                      </p>
                    )}
                    {match.user.location && (
                      <p className="text-xs text-muted-foreground truncate font-medium">
                        📍 {match.user.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {isFetchingMore && (
              <div className="flex justify-center py-4">
                <Loader className="w-5 h-5 animate-spin text-warm-accent" />
              </div>
            )}
          </>
        )}

        {/* Detail View */}
        {selectedMatch && (
          <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-warm-accent">
                  {selectedMatch.user.firstName} {selectedMatch.user.lastName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Profile Photo */}
                {selectedMatch.user.profilePhoto && (
                  <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden ring-2 ring-warm-accent/30">
                    <Image
                      src={selectedMatch.user.profilePhoto}
                      alt={`${selectedMatch.user.firstName} ${selectedMatch.user.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="space-y-2">
                  <p className="text-base text-muted-foreground font-medium">
                    {selectedMatch.user.age && `${selectedMatch.user.age} years old`}
                    {selectedMatch.user.age && selectedMatch.user.location && ' • '}
                    {selectedMatch.user.location && selectedMatch.user.location}
                  </p>

                  {selectedMatch.user.compatibilityScore && (
                    <div>
                      <Badge className="bg-gradient-to-r from-warm-accent to-accent text-white font-bold text-sm shadow-md shadow-warm/40">
                        🔥 {selectedMatch.user.compatibilityScore}% match
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Link href={`/dashboard/profile/${selectedMatch.user.id}`} className="flex-1">
                    <Button variant="outline" className="w-full hover:animate-spring-pop">
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    className="flex-1 bg-gradient-to-r from-warm-accent to-accent hover:from-warm-accent/90 hover:to-accent/90 hover:animate-spring-pop"
                    onClick={() => {
                      onStartConversation(selectedMatch.user.id);
                      onOpenChange(false);
                      setSelectedMatch(null);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Matches button to open the list
 */
export function MatchesButton({
  matchCount,
  onClick,
}: {
  matchCount: number;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-12 px-4 justify-between border-warm-accent/30 hover:border-warm-accent hover:bg-warm-accent/10 hover:scale-105 transition-bounce"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-warm-accent to-accent rounded-full flex items-center justify-center text-white font-bold text-sm animate-spring-bounce">
          ❤️
        </div>
        <div className="text-left">
          <p className="text-xs font-medium">Matches</p>
          <p className="text-xs text-muted-foreground">{matchCount} new</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Button>
  );
}
