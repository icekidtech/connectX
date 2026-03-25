'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Lock, Bell, Shield, Heart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Settings
  const [profile, setProfile] = useState({
    displayName: 'John Doe',
    email: 'john@example.com',
    bio: 'Looking for genuine connections',
    age: '28',
    location: 'San Francisco, CA',
    avatar: '👤',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    lookingFor: ['dating', 'relationships'],
    ageRange: { min: '20', max: '45' },
    distance: '50',
    interests: [],
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    allowMessages: true,
    showOnlineStatus: true,
    verificationRequired: true,
    blockedUsers: [],
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    streams: true,
    marketing: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 text-primary hover:text-primary/80 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, preferences, and account security
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-2 sticky top-8">
              {[
                { id: 'profile', label: 'Profile', icon: Heart },
                { id: 'preferences', label: 'Preferences', icon: Heart },
                { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-foreground font-semibold">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground font-semibold">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="bg-input border-border"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {profile.bio.length}/500 characters
                    </p>
                  </div>

                  {/* Age & Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-foreground font-semibold">
                        Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-foreground font-semibold">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <>
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Looking For</CardTitle>
                    <CardDescription>
                      Select what type of connections you{"'"}re interested in
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {['Dating', 'Relationships', 'Hookups', 'BDSM/Kink', 'Friendship', 'Other'].map((option) => (
                        <div key={option} className="flex items-center gap-3">
                          <Checkbox id={option.toLowerCase()} defaultChecked={['Dating', 'Relationships'].includes(option)} />
                          <Label htmlFor={option.toLowerCase()} className="cursor-pointer text-foreground">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Search Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ageMin" className="text-foreground font-semibold">
                        Age Range
                      </Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="ageMin"
                          type="number"
                          placeholder="Min"
                          value={preferences.ageRange.min}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              ageRange: { ...preferences.ageRange, min: e.target.value },
                            })
                          }
                          className="bg-input border-border"
                        />
                        <span className="text-foreground">to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={preferences.ageRange.max}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              ageRange: { ...preferences.ageRange, max: e.target.value },
                            })
                          }
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="distance" className="text-foreground font-semibold">
                        Distance Radius (km)
                      </Label>
                      <Input
                        id="distance"
                        type="number"
                        value={preferences.distance}
                        onChange={(e) => setPreferences({ ...preferences, distance: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Privacy & Safety */}
            {activeTab === 'privacy' && (
              <>
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <Label className="text-foreground font-semibold">Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Who can see your profile</p>
                      </div>
                      <Select defaultValue={privacy.profileVisibility}>
                        <SelectTrigger className="w-40 bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="verified">Verified Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <Label className="text-foreground font-semibold">Allow Messages</Label>
                        <p className="text-sm text-muted-foreground">Allow others to message you</p>
                      </div>
                      <Switch checked={privacy.allowMessages} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <Label className="text-foreground font-semibold">Show Online Status</Label>
                        <p className="text-sm text-muted-foreground">Let others see when you{"'"}re online</p>
                      </div>
                      <Switch checked={privacy.showOnlineStatus} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <Label className="text-foreground font-semibold">Identity Verification</Label>
                        <p className="text-sm text-muted-foreground">Require verification for new matches</p>
                      </div>
                      <Switch checked={privacy.verificationRequired} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Blocked Users</CardTitle>
                    <CardDescription>Manage your blocked users list</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {privacy.blockedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">You haven{"'"}t blocked anyone yet</p>
                    ) : (
                      <div className="space-y-2">
                        {privacy.blockedUsers.map((user) => (
                          <div key={user} className="flex items-center justify-between p-2 border border-border rounded">
                            <span className="text-foreground">{user}</span>
                            <Button size="sm" variant="outline">
                              Unblock
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control what notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <Label className="text-foreground font-semibold">New Matches</Label>
                      <p className="text-sm text-muted-foreground">When someone likes your profile</p>
                    </div>
                    <Switch checked={notifications.newMatches} />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <Label className="text-foreground font-semibold">Messages</Label>
                      <p className="text-sm text-muted-foreground">When you receive new messages</p>
                    </div>
                    <Switch checked={notifications.messages} />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <Label className="text-foreground font-semibold">Live Streams</Label>
                      <p className="text-sm text-muted-foreground">When someone you follow goes live</p>
                    </div>
                    <Switch checked={notifications.streams} />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <Label className="text-foreground font-semibold">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Promotions and updates from us</p>
                    </div>
                    <Switch checked={notifications.marketing} />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
