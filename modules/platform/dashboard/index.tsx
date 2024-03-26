'use client';
import CodeBox from '@/shared/components/code-box';
import { Button } from '@/shared/components/ui/Button';
import { PLATFORM } from '@/shared/constants/links';
import { VLM_SAMPLE_GO, VLM_SAMPLE_JS, VLM_SAMPLE_PY } from '@/shared/data/vlm-sample';
import useSubscription from '@/shared/hooks/subscription';
import { Check } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
  const subscription = useSubscription();

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
        Dashboard
      </h1>
      <h2 className="text-3xl mt-4">
        {subscription.isSubscribed
          ? 'Welcome to Swarms AI API'
          : 'Subscribe to Swarms AI API'}
      </h2>
      <div className="flex flex-col gap-4 mt-8">
        {subscription.statusLoading && <div>Loading...</div>}
        {!subscription.isLoading && subscription.isSubscribed && (
          <div>
            <div className="border rounded-md relative">
              <CodeBox
                classes={{
                  content: 'h-[50vh] overflow-y-auto'
                }}
                sampleCodes={{
                  python: {
                    sourceCode: VLM_SAMPLE_PY,
                    title: 'main.py'
                  },
                  javascript: {
                    sourceCode: VLM_SAMPLE_JS,
                    title: 'main.js'
                  },
                  go: {
                    sourceCode: VLM_SAMPLE_GO,
                    title: 'main.go'
                  }
                }}
              />
            </div>
          </div>
        )}

        {!subscription.isSubscribed && (
          <div className="border rounded-md p-8 py-10">
            <h2 className="text-2xl font-bold">Subscribe now to get access</h2>
            <span className="text-muted-foreground">
              Swarms AI API subscription includes:
            </span>
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex  items-center gap-2">
                <Check size={24} />
                <span className="text-white">
                  Access to the best Multi-Modal models
                </span>
              </div>
              <div className="flex  items-center gap-2">
                <Check size={24} />
                <span className="text-white">Usage-Based Pricing</span>
              </div>
              <div className="flex  items-center gap-2">
                <Check size={24} />
                <span className="text-white">
                  100% Uptime with 24/7 Support
                </span>
              </div>
            </div>
            <Button
              className="mt-4"
              variant={'default'}
              disabled={subscription.createSubscriptionPortalLoading}
              onClick={subscription.createSubscriptionPortal}
            >
              Subscribe
            </Button>
          </div>
        )}
        <div className="flex gap-4">
          <div className="w-1/2 flex flex-col gap-2 border rounded-md p-8">
            <h2 className="text-2xl font-bold">API Keys</h2>
            <span className="text-muted-foreground">
              Create now an API key to access Swarams AI API.
            </span>
            <Link href={PLATFORM.API_KEYS}>
              <Button className="mt-4" variant={'default'}>
                Create API Key
              </Button>
            </Link>
          </div>
          <div className="w-1/2 flex flex-col gap-2 border rounded-md p-8">
            <h2 className="text-2xl font-bold">Documention</h2>
            <span className="text-muted-foreground">
              Learn how to use Swarms API with our documentation.
            </span>
            <Link href="https://swarms.apac.ai/en/latest/">
              <Button className="mt-4" variant={'default'}>
                Documention
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
