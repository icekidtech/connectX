'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Heart, Loader2, AlertCircle, Upload } from 'lucide-react';
import { fetchCurrentUserProfile, updateUserProfile, type UserProfile } from '@/lib/api/users';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    age: '',
    location: '',
    bio: '',
    relationshipStatus: '',
    lookingFor: [] as string[],
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await fetchCurrentUserProfile();

        if (!profile || !profile.id) {
          // No profile returned, user might not be authenticated
          router.push('/auth/login');
          return;
        }

        setUserProfile(profile);
        setFormData({
          username: profile.username || '',
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          age: profile.age?.toString() || '',
          location: profile.location || '',
          bio: profile.bio || '',
          relationshipStatus: profile.relationshipStatus || '',
          lookingFor: profile.preferences?.lookingFor || [],
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to load your profile';

        // If 401, redirect to login
        if (
          err instanceof Error &&
          (err.message.includes('401') || err.message.includes('Unauthorized'))
        ) {
          router.push('/auth/login');
          return;
        }

        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploadingPhoto(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/users/profile/photo`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo');
      }

      const result = await response.json();
      
      // Update user profile with new photo
      setUserProfile(prev => prev ? { ...prev, photos: [...(prev.photos || []), result] } : null);
      
      toast({
        title: 'Success',
        description: 'Profile photo uploaded successfully',
      });
    } catch (err) {
      console.error('Failed to upload photo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload photo';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);

      // Calculate dateOfBirth from age if provided
      let dateOfBirth: string | undefined;
      if (formData.age) {
        const age = parseInt(formData.age);
        const birthYear = new Date().getFullYear() - age;
        const today = new Date();
        dateOfBirth = new Date(birthYear, today.getMonth(), today.getDate())
          .toISOString()
          .split('T')[0];
      }

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth,
        location: formData.location,
        bio: formData.bio,
        relationshipStatus: formData.relationshipStatus,
      };

      const updatedProfile = await updateUserProfile(updateData);
      setUserProfile(updatedProfile);
      setFormData((prev) => ({
        ...prev,
        age: updatedProfile.age?.toString() || '',
      }));
      setIsEditing(false);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            {!isLoading && (
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSaving}
                className={
                  isEditing
                    ? 'border-border'
                    : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  'Cancel'
                ) : (
                  'Edit Profile'
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Error Loading Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Profile Photo */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-6xl mb-4 overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Photo preview" className="w-full h-full object-cover" />
                  ) : userProfile?.photos?.[0]?.url ? (
                    <img src={userProfile.photos[0].url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={handlePhotoClick}
                      disabled={isUploadingPhoto}
                      variant="outline"
                      className="w-full border-border"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Photo
                        </>
                      )}
                    </Button>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">Verified Profile</span>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Username</label>
                      <Input
                        name="username"
                        value={formData.username}
                        disabled
                        className="bg-muted border-border cursor-not-allowed opacity-60"
                        title="Username cannot be changed"
                      />
                      <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">First Name</label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Last Name</label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Age</label>
                      <Input
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Location</label>
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, State"
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Relationship Status
                      </label>
                      <select
                        name="relationshipStatus"
                        value={formData.relationshipStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
                      >
                        <option>Single</option>
                        <option>In a Relationship</option>
                        <option>It's Complicated</option>
                        <option>Prefer Not to Say</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-4">
                      <p className="text-sm text-muted-foreground mb-1">Username</p>
                      <p className="font-semibold text-foreground">@{formData.username}</p>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold text-foreground">
                          {formData.firstName} {formData.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-semibold text-foreground">{formData.age}</p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Location
                      </p>
                      <p className="font-semibold text-foreground">{formData.location}</p>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Relationship Status
                      </p>
                      <p className="font-semibold text-foreground">{formData.relationshipStatus}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground min-h-24"
                      placeholder="Tell people about yourself..."
                    />
                    <p className="text-xs text-muted-foreground">{formData.bio.length}/500</p>
                  </div>
                ) : (
                  <p className="text-foreground">{formData.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Interests */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Interests & Looking For</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">What are you looking for?</p>
                    <div className="flex flex-wrap gap-2">
                      {['Dating', 'Hookups', 'Relationships', 'BDSM', 'Friends'].map((tag) => (
                        <button
                          key={tag}
                          className={`px-3 py-1 rounded-full text-sm transition ${
                            formData.lookingFor.includes(tag)
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          onClick={() => {
                            if (isEditing) {
                              setFormData({
                                ...formData,
                                lookingFor: formData.lookingFor.includes(tag)
                                  ? formData.lookingFor.filter((t) => t !== tag)
                                  : [...formData.lookingFor, tag],
                              });
                            }
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground mb-3">Your interests</p>
                    <div className="flex flex-wrap gap-2">
                      {['Adventure', 'Music', 'Travel', 'Fitness', 'Art', 'Cooking'].map(
                        (interest) => (
                          <span
                            key={interest}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        )
                      )}
                    </div>
                    {isEditing && (
                      <Button variant="outline" className="w-full mt-4 border-border">
                        Add Interests
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-muted"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-muted"
                >
                  Email Preferences
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-muted"
                >
                  Privacy Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-destructive hover:bg-destructive/10"
                >
                  Deactivate Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
