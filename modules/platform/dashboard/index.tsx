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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-4">Welcome to Swarms</h1>
          <p className="text-xl text-zinc-400">Building The Infrastructure for The Agent Economy</p>
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
        <div className="space-y-12 mb-16">
          {/* Find & Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-8 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-semibold">Agent Marketplace</h2>
            </div>
            <p className="text-zinc-400 mb-6">Discover and monetize your agents, prompts, and MCP servers from world-class vendors</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/" className="block">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Terminal className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Marketplace</h3>
                  <p className="text-sm text-zinc-400">Browse and discover agents, prompts, and tools</p>
                </div>
              </Link>

              <Link href="/platform/registry" className="block">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Code className="h-8 w-8 text-purple-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Registry</h3>
                  <p className="text-sm text-zinc-400">Query and manage your agents and workflows</p>
                </div>
              </Link>

              <Link href="/platform/leaderboard" className="block">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Users className="h-8 w-8 text-emerald-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Leaderboard</h3>
                  <p className="text-sm text-zinc-400">Top agents and contributors</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Developers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-8 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-8 h-8 text-emerald-400" />
              <h2 className="text-2xl font-semibold">Developers</h2>
            </div>
            <p className="text-zinc-400 mb-8">Build with Swarms using Python, Rust, or our Cloud API</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Get Started Code Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Get Started</h3>
                <div className="space-y-4">
                  <div className="bg-zinc-900/50 rounded-xl p-4">
                    <code className="text-blue-400">pip3 install -U swarms</code>
                  </div>

                  <div>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-6 bg-zinc-900/50 rounded-xl p-1">
                        <TabsTrigger value="basic" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          Basic
                        </TabsTrigger>
                        <TabsTrigger value="sequential" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          Sequential
                        </TabsTrigger>
                        <TabsTrigger value="concurrent" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          Concurrent
                        </TabsTrigger>
                        <TabsTrigger value="moa" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          MoA
                        </TabsTrigger>
                        <TabsTrigger value="rust" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          Rust
                        </TabsTrigger>
                        <TabsTrigger value="api" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                          API
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="mt-4">
                        <div className="bg-zinc-900/50 rounded-xl p-4">
                          <code className="text-emerald-400 whitespace-pre text-sm">
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
                          <code className="text-emerald-400 whitespace-pre text-sm">
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
                          <code className="text-emerald-400 whitespace-pre text-sm">
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
                          <code className="text-emerald-400 whitespace-pre text-sm">
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

                      <TabsContent value="rust" className="mt-4">
                        <div className="bg-zinc-900/50 rounded-xl p-4">
                          <code className="text-emerald-400 whitespace-pre text-sm">
{`use swarms_rs::agent::Agent;

let agent = Agent::new()
    .with_model("gpt-4o-mini")
    .with_max_loops(1)
    .build();

let result = agent.run("What are the benefits of multi-agent systems?");`}
                          </code>
                        </div>
                      </TabsContent>

                      <TabsContent value="api" className="mt-4">
                        <div className="bg-zinc-900/50 rounded-xl p-4">
                          <code className="text-emerald-400 whitespace-pre text-sm">
{`curl -X POST https://api.swarms.ai/v1/agents/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "prompt": "What are the benefits of multi-agent systems?"
  }'`}
                          </code>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Developer Tools & Resources */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Developer Tools</h3>
                  <div className="space-y-3">
                    <Link href="https://github.com/kyegomez/swarms" target="_blank" className="block">
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Github className="h-5 w-5 text-emerald-400" />
                            <div>
                              <h4 className="font-semibold">Swarms Python</h4>
                              <p className="text-sm text-zinc-400">Enterprise-grade multi-agent framework</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </div>
                    </Link>

                    <Link href="https://github.com/The-Swarm-Corporation/swarms-rs" target="_blank" className="block">
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Code className="h-5 w-5 text-teal-400" />
                            <div>
                              <h4 className="font-semibold">Swarms Rust</h4>
                              <p className="text-sm text-zinc-400">High-performance Rust implementation</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </div>
                    </Link>

                    <Link href="https://docs.swarms.ai" target="_blank" className="block">
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Book className="h-5 w-5 text-blue-400" />
                            <div>
                              <h4 className="font-semibold">Swarms API Cloud</h4>
                              <p className="text-sm text-zinc-400">Cloud API documentation and guides</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </div>
                    </Link>

                    <Link href="https://docs.swarms.world/en/latest/" target="_blank" className="block">
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Book className="h-5 w-5 text-purple-400" />
                            <div>
                              <h4 className="font-semibold">Documentation</h4>
                              <p className="text-sm text-zinc-400">Learn and build with guides</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Premium Features */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-semibold mb-3">Premium Features</h3>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Build enterprise-grade and bleeding edge applications with the first ever multi-agent API. 
                      Unlock revolutionary Rust-powered agent execution engine with lightning-fast 10x speedup, 
                      massive 5x+ rate limit increases, and access to over 600 cutting-edge AI models. 
                      Built for scale with zero limitations and 24/7 expert support.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-zinc-300">
                        <Check className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">20x more requests per minute (2,000 vs 100)</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-300">
                        <Check className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">200x more requests per hour (10,000 vs 50)</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-300">
                        <Check className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">10x more tokens per agent (2M vs 200K)</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-300">
                        <Check className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">Rust-based agent execution runtime</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="https://docs.swarms.ai/getting-started/rate-limits" target="_blank">
                      <Button variant="outline" className="flex-1 bg-transparent border-blue-400/30 text-blue-400 hover:bg-blue-400/10">
                        Learn More
                      </Button>
                    </Link>
                    <Button 
                      onClick={subscribe}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Community & Resources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-8 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Community & Resources</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href={DISCORD} target="_blank" className="block">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Users className="h-8 w-8 text-indigo-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Discord</h3>
                  <p className="text-sm text-zinc-400">Join our community</p>
                </div>
              </Link>

              <Link href="https://x.com/i/communities/1875452887414804745" target="_blank" className="block">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Users className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Twitter Community</h3>
                  <p className="text-sm text-zinc-400">Connect on X</p>
                </div>
              </Link>

              <Link href={SWARM_CALENDLY} target="_blank" className="block">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <Calendar className="h-8 w-8 text-orange-400 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Book Demo</h3>
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