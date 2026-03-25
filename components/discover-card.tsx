'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, Info } from 'lucide-react';
import Image from 'next/image';

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

interface DiscoverCardProps {
  user: DiscoverUser;
  onLike: (userId: string) => void;
  onPass: (userId: string) => void;
  onShowInfo: (user: DiscoverUser) => void;
}

export function DiscoverCard({ user, onLike, onPass, onShowInfo }: DiscoverCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="h-96 overflow-hidden cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        {!isFlipped ? (
          // Front: User Photo and Basic Info
          <CardContent className="p-0 h-full relative bg-gradient-to-b from-transparent to-black/80">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Overlay with info */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-balance">
                  {user.displayName}, {user.age}
                </h2>
                <p className="text-sm text-gray-200">{user.location}</p>
              </div>

              {/* Compatibility score */}
              <div className="bg-primary/80 backdrop-blur px-3 py-2 rounded-lg mb-4 w-fit">
                <p className="text-xs font-semibold">
                  {Math.round(user.compatibilityScore)}% Compatible
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          // Back: Detailed Info
          <CardContent className="p-6 h-full overflow-y-auto">
            <h3 className="text-xl font-bold mb-3">{user.displayName}</h3>

            {user.bio && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              </div>
            )}

            {user.lookingFor.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">LOOKING FOR</p>
                <div className="flex flex-wrap gap-2">
                  {user.lookingFor.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.interests.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">INTERESTS</p>
                <div className="flex flex-wrap gap-2">
                  {user.interests.slice(0, 6).map((interest) => (
                    <span
                      key={interest.id}
                      className="px-2 py-1 bg-accent/10 text-accent text-xs rounded font-medium"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground mt-6">Click to flip back</p>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 justify-center">
        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full p-0"
          onClick={(e) => {
            e.stopPropagation();
            onPass(user.id);
          }}
        >
          <X className="w-6 h-6" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onShowInfo(user);
          }}
        >
          <Info className="w-5 h-5" />
        </Button>

        <Button
          size="lg"
          className="w-14 h-14 rounded-full p-0 bg-accent hover:bg-accent/90"
          onClick={(e) => {
            e.stopPropagation();
            onLike(user.id);
          }}
        >
          <Heart className="w-6 h-6 fill-current" />
        </Button>
      </div>
    </div>
  );
}
