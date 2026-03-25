'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Mail, Flag, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface UserProfile {
  id: string;
  displayName: string;
  avatar: string;
  age: number;
  location: string;
  bio: string;
  lookingFor: string[];
  interests: Array<{ id: string; name: string }>;
  photos: Array<{ id: string; url: string }>;
  verified: boolean;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('[v0] Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleLike = async () => {
    try {
      await fetch(`/api/matching/${userId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setLiked(true);
    } catch (error) {
      console.error('[v0] Failed to like user:', error);
    }
  };

  const handleMessage = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ participantIds: [userId] }),
      });
      const conversation = await response.json();
      window.location.href = `/dashboard/messages/${conversation.id}`;
    } catch (error) {
      console.error('[v0] Failed to start conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-lg font-semibold text-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Main Photo */}
      <Card className="border-border overflow-hidden">
        <div className="relative aspect-video bg-muted">
          {profile.photos && profile.photos.length > 0 ? (
            <>
              <Image
                src={profile.photos[currentPhotoIndex]?.url || profile.avatar}
                alt={profile.displayName}
                fill
                className="object-cover"
              />
              {profile.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {profile.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl font-bold text-white">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.displayName}
                  </h1>
                  {profile.verified && (
                    <Badge variant="outline" className="bg-blue-50 border-blue-500 text-blue-700">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {profile.age} • {profile.location}
                </p>
              </div>

              {profile.bio && (
                <div>
                  <p className="font-semibold text-foreground mb-2">About</p>
                  <p className="text-foreground whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Looking For */}
          {profile.lookingFor.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Looking For</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.lookingFor.map((type) => (
                    <Badge key={type} variant="secondary" className="capitalize">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest.id} variant="outline">
                      {interest.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Gallery */}
          {profile.photos && profile.photos.length > 1 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {profile.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                      onClick={() =>
                        setCurrentPhotoIndex(profile.photos!.indexOf(photo))
                      }
                    >
                      <Image
                        src={photo.url}
                        alt="Profile photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 gap-2"
            onClick={handleLike}
            disabled={liked}
          >
            <Heart className="w-5 h-5" />
            {liked ? 'Liked!' : 'Like'}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full border-primary/50 gap-2"
            onClick={handleMessage}
          >
            <Mail className="w-5 h-5" />
            Message
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full border-primary/50 gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 gap-2"
          >
            <Flag className="w-5 h-5" />
            Report
          </Button>
        </div>
      </div>
    </div>
  );
}
