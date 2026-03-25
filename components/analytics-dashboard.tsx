'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Download,
  Calendar,
  Activity,
} from 'lucide-react';

// Mock data for charts
const dailyActiveUsersData = [
  { date: 'Mon', users: 2400 },
  { date: 'Tue', users: 1398 },
  { date: 'Wed', users: 9800 },
  { date: 'Thu', users: 3908 },
  { date: 'Fri', users: 4800 },
  { date: 'Sat', users: 3800 },
  { date: 'Sun', users: 4300 },
];

const engagementData = [
  { name: 'Likes', value: 4000 },
  { name: 'Comments', value: 3000 },
  { name: 'Messages', value: 2000 },
  { name: 'Matches', value: 2800 },
];

const matchConversionData = [
  { stage: 'Profiles Viewed', count: 8500 },
  { stage: 'Liked', count: 5200 },
  { stage: 'Matched', count: 3400 },
  { stage: 'Messaged', count: 2100 },
];

const streamingData = [
  { date: 'Mon', viewers: 1200, duration: 45 },
  { date: 'Tue', viewers: 1900, duration: 60 },
  { date: 'Wed', viewers: 800, duration: 30 },
  { date: 'Thu', viewers: 2300, duration: 90 },
  { date: 'Fri', viewers: 2290, duration: 75 },
  { date: 'Sat', viewers: 2000, duration: 120 },
  { date: 'Sun', viewers: 2400, duration: 100 },
];

const COLORS = ['#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b'];

export function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track platform metrics, user engagement, and business insights
              </p>
            </div>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Date Range Selector */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm">
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm">
              Last 90 Days
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users (7D)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">28,543</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">3,847</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+8.2% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Messages Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">128,394</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15.3% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stream Viewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">14,329</div>
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>-3.1% from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="conversion">Match Funnel</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
          </TabsList>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Types Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement by Type</CardTitle>
                  <CardDescription>
                    Distribution of user interactions this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Engagement Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Engagement Activities</CardTitle>
                  <CardDescription>
                    Most common user interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { activity: 'Profile Views', count: 12500, icon: Eye },
                      { activity: 'Likes', count: 8200, icon: Heart },
                      { activity: 'Comments', count: 5800, icon: MessageCircle },
                      { activity: 'Direct Messages', count: 4200, icon: MessageCircle },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-accent" />
                          </div>
                          <span className="font-medium">{item.activity}</span>
                        </div>
                        <span className="font-bold">{item.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Growth Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>
                  Number of users active per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dailyActiveUsersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Match Conversion Funnel</CardTitle>
                <CardDescription>
                  User journey from profile discovery to messaging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={matchConversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Rates Table */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: 'View → Like', rate: '61.2%', change: '+3.2%' },
                    { step: 'Like → Match', rate: '65.4%', change: '+1.8%' },
                    { step: 'Match → Message', rate: '61.8%', change: '-0.5%' },
                    { step: 'Overall Conversion', rate: '24.7%', change: '+4.2%' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                      <span className="font-medium">{item.step}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{item.rate}</span>
                        <Badge variant="outline" className="text-green-600">
                          {item.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Streaming Tab */}
          <TabsContent value="streaming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Streaming Activity</CardTitle>
                <CardDescription>
                  Viewer counts and stream duration trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={streamingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="viewers"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="duration"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ fill: '#ec4899' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Streaming Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Streaming Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Streams', value: '342' },
                    { label: 'Avg Viewers', value: '1,847' },
                    { label: 'Peak Concurrent', value: '3,200' },
                    { label: 'Total Stream Hours', value: '1,240' },
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
