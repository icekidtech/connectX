'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, Video, Users, Settings, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [user] = useState({
    username: 'john_doe',
    avatar: '👤',
    verificationStatus: 'verified',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Welcome, {user.username}</h1>
                <p className="text-xs text-muted-foreground">✓ Verified Profile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <nav className="space-y-2 sticky top-24">
              {[
                { label: 'Feed', icon: Heart, href: '/dashboard' },
                { label: 'Discover', icon: Users, href: '/dashboard/discover' },
                { label: 'Messages', icon: MessageCircle, href: '/dashboard/messages' },
                { label: 'Live Streams', icon: Video, href: '/dashboard/streams' },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Matches', value: '12' },
                { label: 'Messages', value: '8' },
                { label: 'Profile Views', value: '124' },
                { label: 'Followers', value: '45' },
              ].map((stat) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" />
                  Your Feed
                </CardTitle>
                <CardDescription>Curated posts from people you match with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3].map((post) => (
                  <div key={post} className="border-b border-border pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">👤</div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-semibold text-foreground">User Name</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                        <p className="text-sm text-foreground">
                          Just had an amazing time exploring the city! Anyone want to join next time?
                        </p>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="border-border">
                            <Heart className="h-4 w-4 mr-1" /> Like
                          </Button>
                          <Button size="sm" variant="outline" className="border-border">
                            <MessageCircle className="h-4 w-4 mr-1" /> Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Want to see more posts?</p>
                  <Link href="/dashboard/discover">
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Discover More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Matches */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Suggested Matches
                </CardTitle>
                <CardDescription>Based on your preferences and interests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((match) => (
                  <div key={match} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        👤
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">User Name, 24</p>
                        <p className="text-sm text-muted-foreground">2.5 km away • 92% match</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Like
                    </Button>
                  </div>
                ))}

                <Link href="/dashboard/discover">
                  <Button variant="outline" className="w-full border-border">
                    View All Suggestions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-around">
          {[
            { label: 'Feed', icon: Heart, href: '/dashboard' },
            { label: 'Discover', icon: Users, href: '/dashboard/discover' },
            { label: 'Messages', icon: MessageCircle, href: '/dashboard/messages' },
            { label: 'Streams', icon: Video, href: '/dashboard/streams' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className="w-full rounded-none justify-center py-6 text-foreground hover:bg-primary/10"
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile padding */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
