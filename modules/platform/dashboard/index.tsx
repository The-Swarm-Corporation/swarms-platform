'use client';
import CodeBox from '@/shared/components/code-box';
import { Button } from '@/shared/components/ui/Button';
import { DISCORD, PLATFORM, SWARM_CALENDLY } from '@/shared/constants/links';
import {
  VLM_SAMPLE_GO,
  VLM_SAMPLE_JS,
  VLM_SAMPLE_PY,
} from '@/shared/data/vlm-sample';
import useSubscription from '@/shared/hooks/subscription';
import { commaSeparated, formatSepndTime } from '@/shared/utils/helpers';
import { Check } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
  const subscription = useSubscription();

  const timeSaved = formatSepndTime(
    9998777,
    // seconds
  ).split(' ');
  return (
    <div className="w-full flex flex-col">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Home</h1>
      <div className="mt-4 flex gap-4 max-md:flex-col">
        <div className="w-1/3 flex flex-col gap-4 border p-4 rounded-md max-md:w-full">
          <span className="text-primary text-4xl font-bold">
            {commaSeparated(12000)}
          </span>
          <span className="text-bold text-2xl">Tasks Automated</span>
        </div>
        <div className="w-1/3 flex flex-col gap-4 p-4 border rounded-md max-md:w-full">
          <span className="text-primary text-4xl font-bold">
            {commaSeparated(99974)}
          </span>
          <span className="text-bold text-2xl">Agents</span>
        </div>

        <div className="w-1/3 flex flex-col gap-4 p-4 border rounded-md max-md:w-full">
          <span className="flex items-end text-primary text-4xl gap-2 font-bold">
            <span>{timeSaved[0]}</span>
            <span className="text-3xl">{timeSaved[1]}</span>
          </span>
          <span className="text-bold text-2xl">Time Saved</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {subscription.statusLoading && <div>Loading...</div>}
        {!subscription.isLoading && subscription.isSubscribed && (
          <div>
            <div className="relative">
              <CodeBox
                classes={{
                  content: 'h-[50vh] overflow-y-auto',
                }}
                sampleCodes={{
                  python: {
                    sourceCode: VLM_SAMPLE_PY,
                    title: 'main.py',
                  },
                  javascript: {
                    sourceCode: VLM_SAMPLE_JS,
                    title: 'main.js',
                  },
                  go: {
                    sourceCode: VLM_SAMPLE_GO,
                    title: 'main.go',
                  },
                }}
              />
            </div>
          </div>
        )}

        <div className="border rounded-md p-8 py-10">
          <h2 className="text-2xl font-bold">Subscribe now to get access</h2>
          <span className="text-muted-foreground">
            Swarms AI API subscription includes:
          </span>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span>Access to the best Multi-Modal Models</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span>Access to the swarms for special workflows</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span>Usage-Based Pricing for models and swarms</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span>99% Uptime with 24/7 Support</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span>The Explorer: Explore Multi-Modal Models and Swarms</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span>Early Access to new models, swarms, and features!</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span>Coupons and Discounts for usage-based pricing!</span>
            </div>
          </div>
          <Button
            className="mt-4 hover:bg-red-900"
            variant={'default'}
            disabled={subscription.createSubscriptionPortalLoading}
            onClick={subscription.createSubscriptionPortal}
          >
            Subscribe
          </Button>
        </div>
        <div className="flex gap-4 max-sm:flex-wrap">
          <div className="sm:w-1/2 flex flex-col gap-2 border rounded-md p-4">
            <h2 className="text-2xl font-bold">Create an Organization</h2>
            <span className="text-muted-foreground">
              Create an organization to invite your team members and manage your
              projects.
            </span>
            <Link href={PLATFORM.ORGANIZATION}>
              <Button className="mt-4 hover:bg-red-900" variant={'default'}>
                Create Organization
              </Button>
            </Link>
          </div>
          <div className="sm:w-1/2 flex flex-col gap-2 border rounded-md p-4">
            <h2 className="text-2xl font-bold">Add Team Members</h2>
            <span className="text-muted-foreground">
              Invite your team members to collaborate on projects.
            </span>
            <Link href={PLATFORM.ORGANIZATION}>
              <Button className="mt-4 hover:bg-red-900" variant={'default'}>
                Invite Team Members
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-4 max-sm:flex-wrap">
          <div className="sm:w-1/2 flex flex-col gap-2 border rounded-md p-4">
            <h2 className="text-2xl font-bold">API Keys</h2>
            <span className="text-muted-foreground">
              Create now an API key to access an API Key.
            </span>
            <Link href={PLATFORM.API_KEYS}>
              <Button className="mt-4 hover:bg-red-900" variant={'default'}>
                Create API Key
              </Button>
            </Link>
          </div>
          <div className="sm:w-1/2 flex flex-col gap-2 border rounded-md p-4">
            <h2 className="text-2xl font-bold">Documention</h2>
            <span className="text-muted-foreground">
              Learn more about Swarms through our documentation.
            </span>
            <Link href="https://swarms.apac.ai/en/latest/">
              <Button className="mt-4 hover:bg-red-900" variant={'default'}>
                Documention
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-4 border p-4 rounded-md">
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Community</h2>
            <span className="text-muted-foreground">
              Join the Swarms community for real-time support, assistance, and
              conversations with friends!
            </span>
            <div className="flex gap-4 mt-4">
              <Link href={DISCORD}>
                <Button className="hover:bg-red-900" variant={'default'}>
                  Join Community!
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex gap-4 border p-4 rounded-md mb-8">
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Get Demo</h2>
            <span className="text-muted-foreground">
              Get a demo of the Swarms platform and learn how it can help you
              automate your operations.
            </span>
            <div className="flex gap-4 mt-4">
              <Link href={SWARM_CALENDLY}>
                <Button className="hover:bg-red-900" variant={'default'}>
                  Get Demo!
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
