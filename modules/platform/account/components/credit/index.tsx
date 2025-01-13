"use client"


import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import useSubscription from '@/shared/hooks/subscription';
import { trpc } from '@/shared/utils/trpc/trpc';
import { User } from '@supabase/supabase-js';
import { 
  CreditCard, 
  Shield,
  Settings,
  History,
  Plus,
  ChevronRight,
  RefreshCw,
  Wallet,
  AlertCircle
} from 'lucide-react';

export type Plan = 'default' | 'invoice';
const plans: Plan[] = ['default', 'invoice'];

type Tab = 'overview' | 'payment' | 'history' | 'settings';

const transactions = [
  { id: 1, date: '2025-01-10', amount: 500, type: 'Credit Purchase', status: 'completed' },
  { id: 2, date: '2025-01-05', amount: -200, type: 'Service Usage', status: 'completed' },
  { id: 3, date: '2024-12-28', amount: 1000, type: 'Credit Purchase', status: 'completed' }
];

const Credit = ({ user }: { user: User | null }) => {
  const subscription = useSubscription();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [openModals, setOpenModals] = useState<{ [key in Plan]: boolean }>({
    default: false,
    invoice: false,
  });

  const creditPlanQuery = user ? trpc.panel.getUserCreditPlan.useQuery() : null;
  const creditPlanMutation = trpc.panel.updateUserCreditPlan.useMutation();
  const currentPlan = creditPlanQuery?.data?.credit_plan;

  async function handleCreditPlanChange(plan: Plan) {
    if (!user) {
      toast.toast({
        description: 'AUTHENTICATION REQUIRED: LOGIN TO PROCEED',
        variant: 'destructive',
      });
      return;
    }

    try {
      await creditPlanMutation.mutateAsync({
        credit_plan: plan,
      });
      creditPlanQuery?.refetch();
    } catch (error) {
      toast.toast({
        description: (error as any)?.message || 'SYSTEM ERROR',
        variant: 'destructive',
      });
    }
  }

  function handleCreditCharge() {
    if (!user) {
      toast.toast({
        description: 'ACCESS DENIED: LOGIN REQUIRED',
        variant: 'destructive',
      });
      return;
    }

    if (currentPlan === 'invoice') {
      toast.toast({
        description: 'INVOICE PLAN ACTIVE: DIRECT CHARGING DISABLED',
        variant: 'destructive',
      });
      return;
    }
    return subscription.openChargeAccountPortal();
  }

  const TabButton = ({ tab, current, icon: Icon, label }: { 
    tab: Tab, 
    current: Tab, 
    icon: any, 
    label: string 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all duration-300 ${
        tab === current 
          ? 'bg-red-600 text-white' 
          : 'text-red-500 hover:bg-zinc-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="uppercase tracking-wider">{label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Credit Display */}
      <div className="rounded-lg border border-red-500/30 p-8">
        <div className="mb-6">
          <CreditCard className="h-6 w-6 text-red-500 mb-2" />
          <div>
            <span className="text-gray-500 block text-sm mb-1">AVAILABLE CREDITS</span>
            <span className="text-4xl font-bold text-red-500 font-mono tracking-wider">
              {user ? (
                subscription.creditLoading ? (
                  'CALCULATING...'
                ) : (
                  `${(subscription.credit ?? 0).toFixed(2)} ¥`
                )
              ) : (
                '0.00 ¥'
              )}
            </span>
          </div>
        </div>
        
        <Button
          onClick={handleCreditCharge}
          disabled={currentPlan === 'invoice'}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md 
            transition-all duration-300 uppercase tracking-wider flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Credits
        </Button>
      </div>

      {/* Protocol Selection */}
      <div className="rounded-lg border border-red-500/30 p-8">
        <h4 className="text-red-500 font-bold mb-6 uppercase tracking-wider">Active Protocol</h4>
        <div className="grid grid-cols-2 gap-4">
          {plans.map((plan) => (
            <button
              key={plan}
              onClick={() => handleCreditPlanChange(plan)}
              className={`px-4 py-3 rounded-md transition-all duration-300 uppercase tracking-wider ${
                currentPlan === plan
                  ? 'bg-red-600 text-white'
                  : 'border border-red-500/30 text-red-500 hover:bg-zinc-800'
              }`}
            >
              {plan} Protocol
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="rounded-lg border border-red-500/30 p-8">
      <h4 className="text-red-500 font-bold mb-6 uppercase tracking-wider">Transaction History</h4>
      <div className="space-y-4 mb-6">
        {transactions.map(tx => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between p-4 border border-red-500/20 rounded-md"
          >
            <div>
              <p className="text-white">{tx.type}</p>
              <p className="text-gray-500 text-sm">{tx.date}</p>
            </div>
            <span className={`text-lg font-mono ${
              tx.amount >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {tx.amount >= 0 ? '+' : ''}{tx.amount} ¥
            </span>
          </div>
        ))}
      </div>
      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
        <History className="w-5 h-5 mr-2" />
        View Full History
      </Button>
    </div>
  );

  const SettingsTab = () => (
    <div className="rounded-lg border border-red-500/30 p-8">
      <h4 className="text-red-500 font-bold mb-6 uppercase tracking-wider">System Settings</h4>
      <div className="space-y-6">
        {/* Auto-reload Setting */}
        <div className="p-4 border border-red-500/20 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white uppercase tracking-wider">Auto-reload Credits</span>
            <button className="w-12 h-6 bg-zinc-800 rounded-full relative transition-all">
              <div className="w-4 h-4 bg-red-500 rounded-full absolute left-1 top-1" />
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            Automatically reload credits when balance falls below threshold
          </p>
        </div>

        {/* Notification Setting */}
        <div className="p-4 border border-red-500/20 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white uppercase tracking-wider">Usage Notifications</span>
            <button className="w-12 h-6 bg-red-600 rounded-full relative transition-all">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            Receive notifications for high usage patterns
          </p>
        </div>

        {/* Threshold Setting */}
        <div className="p-4 border border-red-500/20 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white uppercase tracking-wider">Low Balance Alert</span>
            <input 
              type="number" 
              className="w-24 px-3 py-1 bg-zinc-800 border border-red-500/30 rounded text-red-500 font-mono"
              defaultValue="100"
            />
          </div>
          <p className="text-gray-500 text-sm">
            Set credit threshold for low balance notifications
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-xl font-bold tracking-wider text-red-500 uppercase flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Credit Management System
          </h3>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <TabButton tab="overview" current={activeTab} icon={Wallet} label="Overview" />

          <TabButton tab="settings" current={activeTab} icon={Settings} label="Settings" />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </section>
  );
};

export default Credit;