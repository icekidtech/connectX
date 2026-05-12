'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Flag,
  User,
  Image,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Trash2,
  Ban,
  MessageSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Report {
  id: string;
  reportedUser: {
    id: string;
    name: string;
    avatar: string;
  };
  reportedBy: {
    id: string;
    name: string;
  };
  reason: 'inappropriate-content' | 'harassment' | 'fraud' | 'spam' | 'nsfw' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  evidence?: string[];
  createdAt: Date;
  resolvedAt?: Date;
  resolvingModerator?: string;
}

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'photo' | 'id';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  images: string[];
  notes?: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    reportedUser: {
      id: 'user1',
      name: 'John Doe',
      avatar: 'https://avatar.example.com/john.jpg',
    },
    reportedBy: {
      id: 'reporter1',
      name: 'Alice Smith',
    },
    reason: 'harassment',
    description: 'User sent multiple inappropriate messages and continued after being told to stop.',
    status: 'reviewing',
    evidence: ['msg_1', 'msg_2', 'msg_3'],
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    reportedUser: {
      id: 'user2',
      name: 'Jane Smith',
      avatar: 'https://avatar.example.com/jane.jpg',
    },
    reportedBy: {
      id: 'reporter2',
      name: 'Bob Johnson',
    },
    reason: 'nsfw',
    description: 'Profile contains explicit content without proper tagging.',
    status: 'pending',
    evidence: ['photo_1', 'photo_2'],
    createdAt: new Date(Date.now() - 7200000),
  },
];

const mockVerifications: VerificationRequest[] = [
  {
    id: 'v1',
    userId: 'user3',
    userName: 'Sarah Lee',
    userAvatar: 'https://avatar.example.com/sarah.jpg',
    type: 'photo',
    status: 'pending',
    submittedAt: new Date(Date.now() - 1800000),
    images: ['selfie_1', 'selfie_2'],
  },
  {
    id: 'v2',
    userId: 'user4',
    userName: 'Michael Chen',
    userAvatar: 'https://avatar.example.com/michael.jpg',
    type: 'id',
    status: 'approved',
    submittedAt: new Date(Date.now() - 86400000),
    images: ['id_front', 'id_back'],
  },
];

export function ModerationDashboard() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [verifications, setVerifications] = useState<VerificationRequest[]>(mockVerifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getReasonBadgeColor = (reason: Report['reason']) => {
    const colors: Record<Report['reason'], string> = {
      'inappropriate-content': 'bg-red-500',
      harassment: 'bg-orange-500',
      fraud: 'bg-red-700',
      spam: 'bg-yellow-500',
      nsfw: 'bg-purple-500',
      other: 'bg-gray-500',
    };
    return colors[reason];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      reviewing: 'secondary',
      resolved: 'default',
      rejected: 'destructive',
      approved: 'default',
    };
    return variants[status] || 'outline';
  };

  const handleApproveReport = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, status: 'resolved', resolvingModerator: 'You' } : r
      )
    );
  };

  const handleRejectReport = (reportId: string) => {
    setReports(reports.map((r) => (r.id === reportId ? { ...r, status: 'rejected' } : r)));
  };

  const handleApproveVerification = (verificationId: string) => {
    setVerifications(
      verifications.map((v) => (v.id === verificationId ? { ...v, status: 'approved' } : v))
    );
  };

  const handleRejectVerification = (verificationId: string) => {
    setVerifications(
      verifications.map((v) => (v.id === verificationId ? { ...v, status: 'rejected' } : v))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Moderation Dashboard</h1>
          <p className="text-muted-foreground">
            Manage reports, verify users, and maintain platform safety
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                {reports.filter((r) => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                {reports.filter((r) => r.status === 'reviewing').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                {verifications.filter((v) => v.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {verifications.filter((v) => v.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="w-4 h-4" />
              Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="verifications" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Verifications ({verifications.length})
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('reviewing')}>
                    Under Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('resolved')}>
                    Resolved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {reports
                .filter((r) => filterStatus === 'all' || r.status === filterStatus)
                .map((report) => (
                  <Card key={report.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage
                                src={report.reportedUser.avatar}
                                alt={report.reportedUser.name}
                              />
                              <AvatarFallback>
                                {report.reportedUser.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{report.reportedUser.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Reported by {report.reportedBy.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 mb-3">
                            <Badge className={getReasonBadgeColor(report.reason)} variant="default">
                              {report.reason.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant={getStatusBadge(report.status)}>
                              {report.status.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">{report.description}</p>

                          <p className="text-xs text-muted-foreground">
                            Reported{' '}
                            {Math.round((Date.now() - report.createdAt.getTime()) / 60000)} minutes
                            ago
                          </p>
                        </div>

                        {report.status === 'pending' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleApproveReport(report.id)}
                                className="text-green-600"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRejectReport(report.id)}
                                className="text-red-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            <div className="space-y-4">
              {verifications.map((verification) => (
                <Card key={verification.id} className="border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage
                              src={verification.userAvatar}
                              alt={verification.userName}
                            />
                            <AvatarFallback>
                              {verification.userName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{verification.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {verification.type === 'photo' ? 'Photo Verification' : 'ID Verification'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline">
                            {verification.type === 'photo' ? (
                              <>
                                <Image className="w-3 h-3 mr-1" />
                                PHOTO
                              </>
                            ) : (
                              <>
                                <FileText className="w-3 h-3 mr-1" />
                                ID
                              </>
                            )}
                          </Badge>
                          <Badge variant={getStatusBadge(verification.status)}>
                            {verification.status.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Submitted{' '}
                          {Math.round((Date.now() - verification.submittedAt.getTime()) / 60000)}{' '}
                          minutes ago
                        </p>
                      </div>

                      {verification.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveVerification(verification.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRejectVerification(verification.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
