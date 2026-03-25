'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShieldAlert,
  BarChart3,
  Users,
  Zap,
  Lock,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage platform operations, moderation, and analytics
          </p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Moderation Card */}
          <Card className="border-border hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <CardTitle>Moderation</CardTitle>
              <CardDescription>
                Review reports, verify users, and manage safety
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending Reports</span>
                  <span className="font-bold text-orange-600">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending Verifications</span>
                  <span className="font-bold">5</span>
                </div>
                <Link href="/dashboard/admin/moderation">
                  <Button className="w-full mt-4">Go to Moderation</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="border-border hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track metrics, user engagement, and platform insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Users (7D)</span>
                  <span className="font-bold">28.5K</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New Matches</span>
                  <span className="font-bold">3.8K</span>
                </div>
                <Link href="/dashboard/admin/analytics">
                  <Button className="w-full mt-4">View Analytics</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* User Management Card */}
          <Card className="border-border hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Users</span>
                  <span className="font-bold">45.2K</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Verified Users</span>
                  <span className="font-bold text-green-600">32.1K</span>
                </div>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health Card */}
          <Card className="border-border hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Monitor server status and system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Response Time</span>
                  <span className="font-bold text-green-600">42ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Database Status</span>
                  <span className="font-bold text-green-600">Healthy</span>
                </div>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="border-border hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-yellow-500" />
              </div>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage security settings and threat detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">SSL Certificate</span>
                  <span className="font-bold text-green-600">Valid</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Blocked IPs</span>
                  <span className="font-bold">234</span>
                </div>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reporting Card */}
          <Card className="border-border hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-500" />
              </div>
              <CardTitle>Reports & Exports</CardTitle>
              <CardDescription>
                Generate business reports and export data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Report</span>
                  <span className="font-bold text-blue-600">Available</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data Export</span>
                  <span className="font-bold">Ready</span>
                </div>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
