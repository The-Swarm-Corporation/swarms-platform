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
    trpc.referral.getUserReferralCode.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data: stats, isLoading: loadingStats } =
    trpc.referral.getReferralStats.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data: tableData, isLoading: loadingTable } =
    trpc.referral.getReferralData.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

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
    <div className="min-h-screen bg-gray-50 text-black dark:bg-black dark:text-white transition-colors duration-200 cyberpunk-bg w-full">
      <main className="container px-0 py-6 md:px-6 lg:px-8">
        <div className="flex items-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-mono font-extrabold uppercase tracking-wider dark:text-white text-black">
            Referral Dashboard
          </h2>
          <div className="ml-auto flex items-center">
            <div className="text-xs font-mono dark:text-red-500/70 text-red-600/70 mr-2">
              USER ID: 8731
            </div>
            <div className="h-4 w-4 rounded-sm border border-red-600 flex items-center justify-center">
              <div className="h-2 w-2 bg-red-600 cyber-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 dark:bg-black/40 bg-white overflow-hidden shadow-lg dark:shadow-red-900/10 cyber-card">
            <CardHeader className="bg-red-600 pb-2 cyber-header">
              <CardTitle className="text-white text-center text-lg font-light tracking-wider flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" /> TOTAL SIGN UPS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-black/80 bg-white relative">
              <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-10"></div>
              <p className="text-5xl font-black text-center dark:text-white text-black cyber-glow relative z-10">
                {loadingStats ? '...' : stats?.totalSignups || 0}
              </p>
              <div className="text-xs text-center mt-2 font-mono dark:text-red-500/70 text-red-600/70">
                {loadingStats ? '...' : formatChange(stats?.weeklyChange || 0)}{' '}
                FROM LAST WEEK
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 dark:bg-black/40 bg-white overflow-hidden shadow-lg dark:shadow-red-900/10 cyber-card">
            <CardHeader className="bg-red-600 pb-2 cyber-header">
              <CardTitle className="text-white text-center text-lg font-light tracking-wider flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" /> CREDITS EARNED
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-black/80 bg-white relative">
              <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-10"></div>
              <p className="text-5xl font-black text-center dark:text-white text-black cyber-glow relative z-10">
                ${loadingStats ? '...' : stats?.totalCredits || 0}
              </p>
              <div className="text-xs text-center mt-2 font-mono dark:text-red-500/70 text-red-600/70">
                CONVERSION RATE:{' '}
                {loadingStats
                  ? '...'
                  : `${(stats?.conversionRate || 0).toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 dark:bg-black/40 bg-white overflow-hidden shadow-lg dark:shadow-red-900/10 cyber-card">
            <CardHeader className="bg-red-600 pb-2 cyber-header">
              <CardTitle className="text-white text-center text-lg font-light tracking-wider flex items-center justify-center gap-2">
                <ChevronRight className="h-4 w-4" /> ACTIVE REFERRALS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-black/80 bg-white relative">
              <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-10"></div>
              <p className="text-5xl font-black text-center dark:text-white text-black cyber-glow relative z-10">
                {loadingStats ? '...' : stats?.activeReferrals || 0}
              </p>
              <div className="text-xs text-center mt-2 font-mono dark:text-red-500/70 text-red-600/70">
                RETENTION:{' '}
                {loadingStats
                  ? '...'
                  : `${(stats?.retentionRate || 0).toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-0 dark:bg-black/40 bg-white overflow-hidden shadow-lg dark:shadow-red-900/10 cyber-card">
          <CardHeader className="bg-red-600 pb-2 cyber-header">
            <CardTitle className="text-white font-light tracking-wider flex items-center">
              <div className="h-4 w-1 bg-white mr-2 skew-x-[-20deg]"></div>
              SHARE YOUR REFERRAL LINK
              <div className="cyber-lines ml-4"></div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-5"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="border-red-600/30 dark:border-red-900/50 bg-white dark:bg-black/90 text-black dark:text-white font-mono cyber-input"
                />
                <Button
                  onClick={copyToClipboard}
                  className="bg-red-600 hover:bg-red-700 text-white cyber-button"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  COPY
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  onClick={() => shareToSocial('Twitter')}
                  variant="outline"
                  className="border-red-600/30 dark:border-red-900/50 hover:bg-red-950/10 dark:text-white text-black dark:hover:border-red-600 cyber-social"
                >
                  <Twitter className="mr-2 h-4 w-4 text-red-600" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareToSocial('Facebook')}
                  variant="outline"
                  className="border-red-600/30 dark:border-red-900/50 hover:bg-red-950/10 dark:text-white text-black dark:hover:border-red-600 cyber-social"
                >
                  <Facebook className="mr-2 h-4 w-4 text-red-600" />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareToSocial('LinkedIn')}
                  variant="outline"
                  className="border-red-600/30 dark:border-red-900/50 hover:bg-red-950/10 dark:text-white text-black dark:hover:border-red-600 cyber-social"
                >
                  <Linkedin className="mr-2 h-4 w-4 text-red-600" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => shareToSocial('Instagram')}
                  variant="outline"
                  className="border-red-600/30 dark:border-red-900/50 hover:bg-red-950/10 dark:text-white text-black dark:hover:border-red-600 cyber-social"
                >
                  <Instagram className="mr-2 h-4 w-4 text-red-600" />
                  Instagram
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 border-0 dark:bg-black/40 bg-white overflow-hidden shadow-lg dark:shadow-red-900/10 cyber-card">
          <CardHeader className="bg-red-600 pb-2 cyber-header">
            <CardTitle className="text-white font-light tracking-wider flex items-center">
              <div className="h-4 w-1 bg-white mr-2 skew-x-[-20deg]"></div>
              REFERRAL ACTIVITY
              <div className="cyber-lines ml-4"></div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-0 md:px-6 relative">
            <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-5"></div>
            <Tabs defaultValue="all" className="relative z-10">
              <TabsList className="grid w-full grid-cols-3 dark:bg-black/90 bg-gray-100 border-0 cyber-tabs">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white dark:text-white text-black rounded-none"
                >
                  ALL
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white dark:text-white text-black rounded-none"
                >
                  PENDING
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white dark:text-white text-black rounded-none"
                >
                  COMPLETED
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="cyber-table-container">
                  <Table>
                    <TableHeader className="dark:bg-red-950/20 bg-gray-100">
                      <TableRow className="border-b-0">
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          NAME
                        </TableHead>
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          EMAIL
                        </TableHead>
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          DATE
                        </TableHead>
                        <TableHead className="font-bold text-right dark:text-white text-black font-mono text-xs">
                          STATUS
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tableData || [])?.map((referral) => (
                        <TableRow
                          key={referral.id}
                          className="border-b dark:border-red-900/20 border-gray-200 dark:hover:bg-red-950/10 hover:bg-gray-50 cyber-row"
                        >
                          <TableCell className="font-medium dark:text-white text-black text-xs md:text-sm">
                            {referral.name}
                          </TableCell>
                          <TableCell className="dark:text-gray-300 text-gray-700 font-mono text-xs md:text-sm">
                            {referral.email}
                          </TableCell>
                          <TableCell className="dark:text-gray-300 text-gray-700 font-mono text-xs md:text-sm">
                            {referral.date}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`px-2 py-1 text-xs font-medium cyber-status ${
                                referral.status === 'Completed'
                                  ? 'bg-green-900/20 text-green-500 dark:text-green-400 cyber-status-complete'
                                  : 'bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 cyber-status-pending'
                              }`}
                            >
                              {referral.status.toUpperCase()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <div className="cyber-table-container">
                  <Table>
                    <TableHeader className="dark:bg-red-950/20 bg-gray-100">
                      <TableRow className="border-b-0">
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          NAME
                        </TableHead>
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          EMAIL
                        </TableHead>
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          DATE
                        </TableHead>
                        <TableHead className="font-bold text-right dark:text-white text-black font-mono text-xs">
                          STATUS
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tableData || [])
                        ?.filter((referral) => referral?.status === 'Pending')
                        ?.map((referral) => (
                          <TableRow
                            key={referral.id}
                            className="border-b dark:border-red-900/20 border-gray-200 dark:hover:bg-red-950/10 hover:bg-gray-50 cyber-row"
                          >
                            <TableCell className="font-medium dark:text-white text-black">
                              {referral.name}
                            </TableCell>
                            <TableCell className="dark:text-gray-300 text-gray-700 font-mono text-sm">
                              {referral.email}
                            </TableCell>
                            <TableCell className="dark:text-gray-300 text-gray-700 font-mono text-sm">
                              {referral.date}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 cyber-status cyber-status-pending">
                                {referral.status.toUpperCase()}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <div className="cyber-table-container">
                  <Table>
                    <TableHeader className="dark:bg-red-950/20 bg-gray-100">
                      <TableRow className="border-b-0">
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          NAME
                        </TableHead>
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          EMAIL
                        </TableHead>
                        <TableHead className="font-bold dark:text-white text-black font-mono text-xs">
                          DATE
                        </TableHead>
                        <TableHead className="font-bold text-right dark:text-white text-black font-mono text-xs">
                          STATUS
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tableData || [])
                        ?.filter((referral) => referral.status === 'Completed')
                        ?.map((referral) => (
                          <TableRow
                            key={referral.id}
                            className="border-b dark:border-red-900/20 border-gray-200 dark:hover:bg-red-950/10 hover:bg-gray-50 cyber-row"
                          >
                            <TableCell className="font-medium dark:text-white text-black">
                              {referral.name}
                            </TableCell>
                            <TableCell className="dark:text-gray-300 text-gray-700 font-mono text-sm">
                              {referral.email}
                            </TableCell>
                            <TableCell className="dark:text-gray-300 text-gray-700 font-mono text-sm">
                              {referral.date}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="px-2 py-1 text-xs font-medium bg-green-900/20 text-green-500 dark:text-green-400 cyber-status cyber-status-complete">
                                {referral.status.toUpperCase()}
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
