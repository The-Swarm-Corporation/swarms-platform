import { Button } from '@/shared/components/ui/Button';
import { PLATFORM } from '@/shared/constants/links';
import { Check } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
  return (
    <div className="w-full flex flex-col">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
        Dashboard
      </h1>
      <h2 className="text-3xl mt-4">What are you going to build next?</h2>
      <span className="text-base text-muted-foreground">
        Use this dashboard to configure your account and begin building AI
        products with our API.
      </span>
      <div className="flex flex-col gap-4 mt-8">
        <div className="border rounded-md p-8 py-10">
          <h2 className="text-2xl font-bold">Subscribe now to get access</h2>
          <span className="text-muted-foreground">
            Swarms AI API subscription includes:
          </span>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span className="text-white">1000 free requests</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span className="text-white">1000 free requests</span>
            </div>
            <div className="flex  items-center gap-2">
              <Check size={24} />
              <span className="text-white">1000 free requests</span>
            </div>
          </div>
          <Button className="mt-4" variant={'default'}>
            Subscribe
          </Button>
        </div>
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
            <Link href={PLATFORM.API_KEYS}>
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
