'use client';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Button } from '@/shared/components/ui/button';
import { DISCORD, PLATFORM, SWARM_CALENDLY } from '@/shared/utils/constants';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { commaSeparated, formatSpentTime } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Check, Code, Github } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/shared/components/ui/badge';

const TIME_IN_MIN = 10;
const Dashboard = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  const agentsRequests = user
    ? trpc.explorer.getAgentsByUserId.useQuery(user?.id)
    : null;
  const agentsLength = agentsRequests ? agentsRequests?.data?.data?.length : 0;
  const agentsEnding = agentsLength && agentsLength > 1 ? 's' : '';

  const userRequests = user
    ? trpc.dashboard.getUserRequestCount.useQuery()
    : null;
  const requestCount = userRequests?.data ?? 0;
  const timeSaved = useMemo(() => {
    const timeInSecs = TIME_IN_MIN * 60;
    const estimatedTimeSaved = requestCount * timeInSecs;

    return formatSpentTime(estimatedTimeSaved).split(' ');
  }, [userRequests?.data]);

  async function subscribe() {
    await checkUserSession();
    router.push('/pricing');
  }

  const agentsGoal = agentsLength ? agentsLength * 5 : 0;

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Home</h1>
      <div className="mt-4 flex gap-4 max-md:flex-col">
        <div className="w-1/3 flex flex-col gap-4 border p-4 rounded-md max-md:w-full">
          {userRequests?.isLoading ? (
            <LoadingSpinner />
          ) : (
            <span className="text-primary text-4xl font-bold">
              {commaSeparated(requestCount)}
            </span>
          )}
          <span className="text-bold text-2xl">Tasks Automated</span>
        </div>
        <div className="w-1/3 flex flex-col gap-4 p-4 border rounded-md max-md:w-full">
          {agentsRequests?.isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="text-primary text-4xl font-bold flex items-center gap-2">
              {commaSeparated(agentsLength ?? 0)}
              <Badge
                variant="outline"
                className={` bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/30 text-white py-1 px-3 shadow-sm`}
              >
                Next Goal: ⭐ {commaSeparated(agentsGoal)}
              </Badge>
            </div>
          )}
          <span className="text-bold text-2xl">Agent{agentsEnding} </span>
        </div>
        <div className="w-1/3 flex flex-col gap-4 p-4 border rounded-md max-md:w-full">
          {userRequests?.isLoading ? (
            <LoadingSpinner />
          ) : (
            <span className="flex items-end text-primary text-4xl gap-2 font-bold">
              <span>{timeSaved[0]}</span>
              <span className="text-3xl">{timeSaved[1]}</span>
            </span>
          )}
          <span className="text-bold text-2xl">Time Saved</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="border rounded-md p-8 py-10">
          <h2 className="text-2xl font-bold">Access Our Premium Platforms</h2>
          <span className="text-muted-foreground">
            Get access to our powerful AI platforms and tools:
          </span>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>
                Spreadsheet Swarm - Advanced spreadsheet automation and analysis
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>Drag & Drop Swarm - Intuitive AI workflow builder</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>Real-time support via our active Discord community</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>Access to cutting-edge Multi-Modal AI Models</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>Flexible usage-based pricing with special discounts</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>Early access to new features and platforms</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={24} />
              <span>24/7 Technical support with 99% uptime guarantee</span>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button
              className="hover:bg-red-900"
              variant="default"
              onClick={subscribe}
            >
              Subscribe Now
            </Button>
          </div>
        </div>

        {/* New GitHub SDK Section */}
        <div className="border rounded-md p-8 py-10">
          <div className="flex items-center gap-3">
            <Github size={32} />
            <h2 className="text-2xl font-bold">Swarms SDK</h2>
          </div>
          <span className="text-muted-foreground block mt-2">
            Get started with our open-source SDK and build powerful AI
            applications
          </span>

          <div className="mt-6 bg-zinc-900 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <code className="text-green-400">pip3 install -U swarms</code>
              <Code size={20} className="text-zinc-400" />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Link href="https://github.com/kyegomez/swarms" target="_blank">
              <Button className="hover:bg-red-900" variant="default">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-4 max-sm:flex-wrap">
          <div className="sm:w-1/2 flex flex-col gap-2 border rounded-md p-4">
            <h2 className="text-2xl font-bold">Swarms Chat</h2>
            <span className="text-muted-foreground">
              Create your api key and interact with the swarms chat interface
            </span>
            <Link href={PLATFORM.CHAT}>
              <Button className="mt-4 hover:bg-red-900 bg-primary/50" variant="default">
                View Chat
              </Button>
            </Link>
          </div>
          <div className="sm:w-1/2 flex flex-col gap-2 border rounded-md p-4">
            <h2 className="text-2xl font-bold">Documentation</h2>
            <span className="text-muted-foreground">
              Learn more about Swarms through our comprehensive documentation.
            </span>
            <Link target='_blank' rel="noopener noreferrer" href="https://docs.swarms.world/en/latest/">
              <Button className="mt-4 hover:bg-red-900 bg-primary/50" variant="default">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-4 max-sm:flex-wrap">
          <div className="flex gap-4 border p-4 rounded-md">
            <div className="w-full flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Join Our Community</h2>
              <span className="text-muted-foreground">
                Connect with other users, get support, and stay updated on the
                latest features!
              </span>
              <div className="flex gap-4 mt-4">
                <Link target="_blank" rel="noopener noreferrer" href={DISCORD}>
                  <Button className="hover:bg-red-900 bg-primary/50" variant="default">
                    Join Discord Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex gap-4 border p-4 rounded-md mb-8">
            <div className="w-full flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Schedule a Demo</h2>
              <span className="text-muted-foreground">
                See how Swarms can transform your workflow with a personalized
                demo.
              </span>
              <div className="flex gap-4 mt-4">
                <Link target="_blank" rel="noopener noreferrer" href={SWARM_CALENDLY}>
                  <Button className="hover:bg-red-900 bg-primary/50" variant="default">
                    Book Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
