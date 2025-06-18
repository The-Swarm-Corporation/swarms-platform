'use client';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import CardManager from './components/card-manager';
import Credit from './components/credit';
import SubscriptionStatus from './components/subscription-status';
import Link from 'next/link';
import { AUTH } from '@/shared/utils/constants';
import ThemeToggle from '@/shared/components/theme-toggle';
import CryptoWallet from './components/crypto-wallet';
import { UserCircle, CreditCard, Wallet, Palette } from 'lucide-react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export default function Account() {
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const { data: userData } = trpc.main.getUser.useQuery();

  useEffect(() => {
    const type = searchParams?.get('payment_type');
    if (type === 'billing') {
      setActiveTab('billing');
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-10 max-md:px-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="max-md:px-0">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and manage your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-md:px-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userData?.full_name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={userData?.username || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userData?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Password</h3>
                <Link href={AUTH.CHANGE_PASSWORD}>
                  <Button variant="outline">Change password</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader className="max-md:px-0">
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and view subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-md:px-0">
              {user && (
                <>
                  <Credit user={user} />
                  <Separator />
                  <CardManager />
                  <Separator />
                  <SubscriptionStatus />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <Card>
            <CardHeader className="max-md:px-0">
              <CardTitle>Crypto Wallet</CardTitle>
              <CardDescription>
                Manage your cryptocurrency wallet and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="max-md:px-0">
              {user && <CryptoWallet user={user} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader className="max-md:px-0">
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize your application appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="max-md:px-0">
              <ThemeToggle />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
