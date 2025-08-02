'use client';

import LoadingSpinner from '@/shared/components/loading-spinner';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Button } from '@/shared/components/ui/button';
import { DISCORD, PLATFORM, SWARM_CALENDLY } from '@/shared/utils/constants';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { commaSeparated, formatSpentTime } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Check, Code, Github, ArrowRight, Terminal, Book, Users, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { motion } from 'framer-motion';

const TIME_IN_MIN = 10;

const Dashboard = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  const agentsRequests = user ? trpc.explorer.getAgentsByUserId.useQuery(user?.id) : null;
  const agentsLength = agentsRequests ? agentsRequests?.data?.data?.length : 0;
  const agentsEnding = agentsLength && agentsLength > 1 ? 's' : '';

  const userRequests = user ? trpc.dashboard.getUserRequestCount.useQuery() : null;
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-4">Welcome to Swarms</h1>
          <p className="text-xl text-zinc-400">Build powerful AI agents and workflows with enterprise-grade infrastructure</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-8 border border-zinc-700/50"
          >
            {userRequests?.isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {commaSeparated(requestCount)}
                </span>
                <p className="mt-2 text-zinc-400 text-lg">Tasks Automated</p>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-8 border border-zinc-700/50"
          >
            {agentsRequests?.isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {commaSeparated(agentsLength ?? 0)}
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-400/30 text-emerald-400">
                    Goal: {commaSeparated(agentsGoal)}
                  </Badge>
                </div>
                <p className="mt-2 text-zinc-400 text-lg">Active Agent{agentsEnding}</p>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-8 border border-zinc-700/50"
          >
            {userRequests?.isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                    {timeSaved[0]}
                  </span>
                  <span className="text-3xl text-rose-400/80 mb-1">{timeSaved[1]}</span>
                </div>
                <p className="mt-2 text-zinc-400 text-lg">Time Saved</p>
              </>
            )}
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Get Started Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-8 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-semibold">Get Started</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-900/50 rounded-xl p-4">
                <code className="text-blue-400">pip3 install -U swarms</code>
              </div>

              <div className="mt-8">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-zinc-900/50 rounded-xl p-1">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                      Basic
                    </TabsTrigger>
                    <TabsTrigger value="sequential" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                      Sequential
                    </TabsTrigger>
                    <TabsTrigger value="concurrent" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                      Concurrent
                    </TabsTrigger>
                    <TabsTrigger value="moa" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                      MoA
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="mt-4">
                    <div className="bg-zinc-900/50 rounded-xl p-4">
                      <code className="text-blue-400 whitespace-pre text-sm">
{`from swarms import Agent

agent = Agent(
    model_name="gpt-4o-mini",
    max_loops=1,
    interactive=True,
)

agent.run("What are the benefits of multi-agent systems?")`}
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="sequential" className="mt-4">
                    <div className="bg-zinc-900/50 rounded-xl p-4">
                      <code className="text-blue-400 whitespace-pre text-sm">
{`from swarms import Agent, SequentialWorkflow

researcher = Agent(
    agent_name="Researcher",
    system_prompt="Research and summarize the topic.",
    model_name="gpt-4o-mini",
)

writer = Agent(
    agent_name="Writer",
    system_prompt="Write an engaging blog post.",
    model_name="gpt-4o-mini",
)

workflow = SequentialWorkflow(agents=[researcher, writer])
final_post = workflow.run("The future of AI")`}
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="concurrent" className="mt-4">
                    <div className="bg-zinc-900/50 rounded-xl p-4">
                      <code className="text-blue-400 whitespace-pre text-sm">
{`from swarms import Agent, ConcurrentWorkflow

market_analyst = Agent(
    agent_name="Market-Analyst",
    system_prompt="Analyze market trends.",
    model_name="gpt-4o-mini",
)

financial_analyst = Agent(
    agent_name="Financial-Analyst",
    system_prompt="Provide financial analysis.",
    model_name="gpt-4o-mini",
)

workflow = ConcurrentWorkflow(
    agents=[market_analyst, financial_analyst],
)

results = workflow.run("AI industry analysis")`}
                      </code>
                    </div>
                  </TabsContent>

                  <TabsContent value="moa" className="mt-4">
                    <div className="bg-zinc-900/50 rounded-xl p-4">
                      <code className="text-blue-400 whitespace-pre text-sm">
{`from swarms import Agent, MixtureOfAgents

experts = [
    Agent(name="FinancialAnalyst"),
    Agent(name="MarketAnalyst"),
    Agent(name="RiskAnalyst"),
]

aggregator = Agent(
    name="InvestmentAdvisor",
    system_prompt="Synthesize expert analyses.",
)

moa = MixtureOfAgents(
    agents=experts,
    aggregator_agent=aggregator,
)

result = moa.run("NVIDIA stock analysis")`}
                      </code>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Link href="https://github.com/kyegomez/swarms" target="_blank">
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-8"
          >
            {/* Premium Features */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/20">
              <h2 className="text-2xl font-semibold mb-4">Premium Features</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Check className="h-5 w-5 text-blue-400" />
                  <span>Advanced spreadsheet automation</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Check className="h-5 w-5 text-blue-400" />
                  <span>Intuitive AI workflow builder</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Check className="h-5 w-5 text-blue-400" />
                  <span>Multi-Modal AI Models access</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Check className="h-5 w-5 text-blue-400" />
                  <span>24/7 Technical support</span>
                </div>
              </div>
              <Button 
                onClick={subscribe}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Link href={PLATFORM.CHAT} className="block">
                <div className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Terminal className="h-6 w-6 text-blue-400 mb-2" />
                  <h3 className="font-semibold">Swarms Chat</h3>
                  <p className="text-sm text-zinc-400">Interactive AI interface</p>
                </div>
              </Link>

              <Link href="https://docs.swarms.world/en/latest/" target="_blank" className="block">
                <div className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Book className="h-6 w-6 text-purple-400 mb-2" />
                  <h3 className="font-semibold">Documentation</h3>
                  <p className="text-sm text-zinc-400">Learn and build</p>
                </div>
              </Link>

              <Link href={DISCORD} target="_blank" className="block">
                <div className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Users className="h-6 w-6 text-emerald-400 mb-2" />
                  <h3 className="font-semibold">Community</h3>
                  <p className="text-sm text-zinc-400">Join Discord</p>
                </div>
              </Link>

              <Link href={SWARM_CALENDLY} target="_blank" className="block">
                <div className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Calendar className="h-6 w-6 text-rose-400 mb-2" />
                  <h3 className="font-semibold">Book Demo</h3>
                  <p className="text-sm text-zinc-400">See Swarms in action</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;