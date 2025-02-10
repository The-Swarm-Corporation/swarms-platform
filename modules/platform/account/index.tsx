'use client';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import CardManager from './components/card-manager';
import Credit from './components/credit';
import SubscriptionStatus from './components/subscription-status';
import Link from 'next/link';
import { AUTH } from '@/shared/utils/constants';
import ThemeToggle from '@/shared/components/theme-toggle';
import CryptoWallet from './components/crypto-wallet';
import { UserCircle, CreditCard, Wallet } from 'lucide-react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';

export default function Account() {
  const { user } = useAuthContext();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
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
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and manage your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Credit user={user} />
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
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and view subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user && (
                <>
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
            <CardHeader>
              <CardTitle>Crypto Wallet</CardTitle>
              <CardDescription>
                Manage your cryptocurrency wallet and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && <CryptoWallet user={user} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}