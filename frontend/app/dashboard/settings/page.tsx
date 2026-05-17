'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Mail,
  Shield,
  Lock,
  Globe,
  User,
  LogOut,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NotificationSettings {
  matches: boolean;
  messages: boolean;
  likes: boolean;
  comments: boolean;
  newFollowers: boolean;
  systemUpdates: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends-only';
  showOnlineStatus: boolean;
  allowMessages: 'everyone' | 'verified' | 'matches-only';
  allowSearch: boolean;
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    matches: true,
    messages: true,
    likes: true,
    comments: false,
    newFollowers: true,
    systemUpdates: false,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: 'everyone',
    allowSearch: true,
  });

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account, privacy, and preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Download className="w-4 h-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose which notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Matches */}
                <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">New Matches</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you match with someone
                    </p>
                  </div>
                  <Switch
                    checked={notifications.matches}
                    onCheckedChange={() => handleNotificationChange('matches')}
                  />
                </div>

                {/* Messages */}
                <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new messages from matches
                    </p>
                  </div>
                  <Switch
                    checked={notifications.messages}
                    onCheckedChange={() => handleNotificationChange('messages')}
                  />
                </div>

                {/* Likes */}
                <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">Likes & Reactions</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone likes your profile or posts
                    </p>
                  </div>
                  <Switch
                    checked={notifications.likes}
                    onCheckedChange={() => handleNotificationChange('likes')}
                  />
                </div>

                {/* Comments */}
                <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">Comments</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone comments on your posts
                    </p>
                  </div>
                  <Switch
                    checked={notifications.comments}
                    onCheckedChange={() => handleNotificationChange('comments')}
                  />
                </div>

                {/* New Followers */}
                <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">New Followers</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone follows your profile
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newFollowers}
                    onCheckedChange={() => handleNotificationChange('newFollowers')}
                  />
                </div>

                {/* System Updates */}
                <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">System Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about important platform updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={() => handleNotificationChange('systemUpdates')}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Reset to Default</Button>
              <Button className="bg-accent hover:bg-accent/90">Save Preferences</Button>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
                <CardDescription>Control who can see your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { id: 'public', label: 'Public', description: 'Anyone can view your profile' },
                    {
                      id: 'friends-only',
                      label: 'Matches Only',
                      description: "Only people you've matched with",
                    },
                    {
                      id: 'private',
                      label: 'Private',
                      description: 'Only you can see your profile',
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5"
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option.id}
                        checked={privacy.profileVisibility === option.id}
                        onChange={(e) =>
                          setPrivacy((prev) => ({
                            ...prev,
                            profileVisibility: e.target.value as any,
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Online Status</CardTitle>
                <CardDescription>Control your online status visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Online Status</p>
                    <p className="text-sm text-muted-foreground">
                      Others can see when you're online
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showOnlineStatus}
                    onCheckedChange={() =>
                      setPrivacy((prev) => ({
                        ...prev,
                        showOnlineStatus: !prev.showOnlineStatus,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Requests</CardTitle>
                <CardDescription>Who can send you direct messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'everyone', label: 'Everyone', description: 'Anyone can message you' },
                  {
                    id: 'verified',
                    label: 'Verified Users Only',
                    description: 'Only verified users',
                  },
                  {
                    id: 'matches-only',
                    label: 'Matches Only',
                    description: "Only people you've matched with",
                  },
                ].map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5"
                  >
                    <input
                      type="radio"
                      name="messages"
                      value={option.id}
                      checked={privacy.allowMessages === option.id}
                      onChange={(e) =>
                        setPrivacy((prev) => ({
                          ...prev,
                          allowMessages: e.target.value as any,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Reset to Default</Button>
              <Button className="bg-accent hover:bg-accent/90">Save Privacy Settings</Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA Status</p>
                    <p className="text-sm text-muted-foreground">Currently disabled</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    device: 'Chrome on Mac',
                    time: 'Today at 10:30 AM',
                    location: 'San Francisco, CA',
                  },
                  {
                    device: 'Mobile Safari on iPhone',
                    time: 'Yesterday at 8:45 PM',
                    location: 'San Francisco, CA',
                  },
                  { device: 'Chrome on Windows', time: '2 days ago', location: 'Oakland, CA' },
                ].map((login, idx) => (
                  <div key={idx} className="p-3 border border-border rounded-lg">
                    <p className="font-medium text-sm">{login.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {login.time} • {login.location}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Download Your Data</CardTitle>
                <CardDescription>Get a copy of all your personal data</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertDescription>
                    Your data will be compiled and available for download within 24 hours
                  </AlertDescription>
                </Alert>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Request Data Export
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    This action cannot be undone. All your data will be permanently deleted.
                  </AlertDescription>
                </Alert>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logout</CardTitle>
                <CardDescription>Sign out from your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
