'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Heart, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    age: '26',
    location: 'San Francisco, CA',
    bio: 'Love adventure, travel, and meeting new people',
    relationshipStatus: 'Single',
    lookingFor: ['Dating', 'Relationships'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to update profile
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <Button
              variant={isEditing ? 'outline' : 'default'}
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? 'border-border' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          {/* Profile Photo */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-6xl mb-4">
                👤
              </div>
              {isEditing && (
                <Button variant="outline" className="w-full border-border">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload New Photo
                </Button>
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
                    <label className="text-sm font-medium text-foreground">Relationship Status</label>
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

                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold text-foreground">{formData.firstName} {formData.lastName}</p>
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
                    {['Adventure', 'Music', 'Travel', 'Fitness', 'Art', 'Cooking'].map((interest) => (
                      <span key={interest} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
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
              <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                Email Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-muted">
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start border-border text-destructive hover:bg-destructive/10">
                Deactivate Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
