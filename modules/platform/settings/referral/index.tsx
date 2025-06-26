'use client';

import { useEffect, useState } from 'react';
import {
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ChevronRight,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';

export default function ReferralDashboard() {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState('');

  const { data: referralData, isLoading: loadingReferral } =
    trpc.referral.getUserReferralCode.useQuery();

  const { data: stats, isLoading: loadingStats } =
    trpc.referral.getReferralStats.useQuery();

  const { data: tableData, isLoading: loadingTable } =
    trpc.referral.getReferralData.useQuery();

  useEffect(() => {
    if (referralData?.link) {
      setReferralLink(referralData.link);
    }
  }, [referralData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ description: 'Referral link copied to clipboard' });
  };

  const shareToSocial = (platform: string) => {
    let shareUrl;

    switch (platform) {
      case 'Twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=Join me on this platform and get started with a special offer!&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'Facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'LinkedIn':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        break;
      case 'Instagram':
        // Instagram doesn't have a direct share URL, but we can copy the link for Instagram
        navigator.clipboard.writeText(referralLink);
        toast({ description: `Link copied for ${platform} sharing` });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }

    toast({ description: `Sharing to ${platform}` });
  };

  // Format numbers for display
  const formatChange = (value: number) => {
    if (value > 0) return `+${value.toFixed(1)}%`;
    if (value < 0) return `${value.toFixed(1)}%`;
    return '0%';
  };

  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-sm text-slate-100 w-full">
      <main className="container px-4 py-8 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Referral Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your referrals and earn rewards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border border-gray-800 bg-black shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    Total Signups
                  </p>
                  <p className="text-3xl font-bold text-slate-100">
                    {loadingStats ? '...' : stats?.totalSignups || 0}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {loadingStats ? '...' : formatChange(stats?.weeklyChange || 0)} from last week
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-black shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    Credits Earned
                  </p>
                  <p className="text-3xl font-bold text-slate-100">
                    ${loadingStats ? '...' : stats?.totalCredits || 0}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {(stats?.conversionRate || 0).toFixed(1)}% conversion rate
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-black shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    Active Referrals
                  </p>
                  <p className="text-3xl font-bold text-slate-100">
                    {loadingStats ? '...' : stats?.activeReferrals || 0}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {(stats?.retentionRate || 0).toFixed(1)}% retention rate
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card className="border border-gray-800 bg-black shadow-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Share Your Referral Link
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Share this link with friends and earn rewards when they sign up
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 bg-gray-900 border-gray-700 text-slate-100 font-mono text-sm"
                placeholder="Loading referral link..."
              />
              <Button
                onClick={copyToClipboard}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => shareToSocial('Twitter')}
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-900 text-slate-300"
              >
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
              <Button
                onClick={() => shareToSocial('Facebook')}
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-900 text-slate-300"
              >
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </Button>
              <Button
                onClick={() => shareToSocial('LinkedIn')}
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-900 text-slate-300"
              >
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                onClick={() => shareToSocial('Instagram')}
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-900 text-slate-300"
              >
                <Instagram className="mr-2 h-4 w-4" />
                Instagram
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Activity */}
        <Card className="border border-gray-800 bg-black shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Referral Activity
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Track your referral performance and status
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-700">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-black data-[state=active]:text-slate-100 data-[state=active]:shadow-sm text-slate-400"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-black data-[state=active]:text-slate-100 data-[state=active]:shadow-sm text-slate-400"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-black data-[state=active]:text-slate-100 data-[state=active]:shadow-sm text-slate-400"
                >
                  Completed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="rounded-lg border border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900/50">
                      <TableRow className="border-gray-700">
                        <TableHead className="font-semibold text-slate-100">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-slate-100">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold text-slate-100">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold text-right text-slate-100">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tableData || [])?.map((referral) => (
                        <TableRow
                          key={referral.id}
                          className="border-gray-700 hover:bg-gray-900/50"
                        >
                          <TableCell className="font-medium text-slate-100">
                            {referral.name}
                          </TableCell>
                          <TableCell className="text-slate-400 font-mono text-sm">
                            {referral.email}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {referral.date}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                referral.status === 'Completed'
                                  ? 'bg-green-900/30 text-green-400'
                                  : 'bg-yellow-900/30 text-yellow-400'
                              }`}
                            >
                              {referral.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <div className="rounded-lg border border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900/50">
                      <TableRow className="border-gray-700">
                        <TableHead className="font-semibold text-slate-100">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-slate-100">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold text-slate-100">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold text-right text-slate-100">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tableData || [])
                        ?.filter((referral) => referral?.status === 'Pending')
                        ?.map((referral) => (
                          <TableRow
                            key={referral.id}
                            className="border-gray-700 hover:bg-gray-900/50"
                          >
                            <TableCell className="font-medium text-slate-100">
                              {referral.name}
                            </TableCell>
                            <TableCell className="text-slate-400 font-mono text-sm">
                              {referral.email}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {referral.date}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
                                {referral.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="rounded-lg border border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900/50">
                      <TableRow className="border-gray-700">
                        <TableHead className="font-semibold text-slate-100">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-slate-100">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold text-slate-100">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold text-right text-slate-100">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tableData || [])
                        ?.filter((referral) => referral.status === 'Completed')
                        ?.map((referral) => (
                          <TableRow
                            key={referral.id}
                            className="border-gray-700 hover:bg-gray-900/50"
                          >
                            <TableCell className="font-medium text-slate-100">
                              {referral.name}
                            </TableCell>
                            <TableCell className="text-slate-400 font-mono text-sm">
                              {referral.email}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {referral.date}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                                {referral.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
