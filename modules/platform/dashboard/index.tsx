'use client';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Button } from '@/shared/components/ui/button';
import { ExternalLink, MessageCircle, Youtube, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FrameworksGrid from '@/shared/components/frameworks-grid';

const Dashboard = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-9xl font-extrabold sm:text-6xl">Swarms Platform</h1>
      <p className="text-muted-foreground mt-2 text-lg">
        Build, deploy, and scale autonomous AI agents with enterprise-grade infrastructure. 
        From development to marketplace monetization, Swarms provides the complete toolkit for the agent economy.
      </p>

      <div className="flex flex-col gap-4 mt-8">

        {/* Frameworks Grid Section */}
        <FrameworksGrid />

        {/* Cookbook and Templates Section */}
        <div className="w-full rounded-md p-8 py-10">
          <h2 className="text-2xl font-bold mb-2">Cookbook and Templates</h2>
          <p className="text-muted-foreground mb-6">
            Get started quickly with our curated examples, templates, and research implementations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-2">Examples Overview</h3>
              <p className="text-gray-400 text-sm mb-4">
                Complete examples directory with comprehensive guides
              </p>
              <Link href="https://docs.swarms.world/en/latest/examples/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full hover:bg-green-700 bg-green-600" variant="default" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Examples
                </Button>
              </Link>
            </div>

            <div className="rounded-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-2">Cookbook Index</h3>
              <p className="text-gray-400 text-sm mb-4">
                Curated example collection for common use cases
              </p>
              <Link href="https://docs.swarms.world/en/latest/examples/cookbook_index/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full hover:bg-green-700 bg-green-600" variant="default" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Browse Cookbook
                </Button>
              </Link>
            </div>

            <div className="rounded-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-2">Paper Implementations</h3>
              <p className="text-gray-400 text-sm mb-4">
                Research paper implementations and academic examples
              </p>
              <Link href="https://docs.swarms.world/en/latest/examples/paper_implementations/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full hover:bg-green-700 bg-green-600" variant="default" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Papers
                </Button>
              </Link>
            </div>

            <div className="rounded-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-2">Templates & Applications</h3>
              <p className="text-gray-400 text-sm mb-4">
                Reusable templates for rapid development
              </p>
              <Link href="https://docs.swarms.world/en/latest/examples/templates/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full hover:bg-green-700 bg-green-600" variant="default" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="w-full rounded-md p-8 py-10">
          <h2 className="text-2xl font-bold mb-2">Community</h2>
          <p className="text-muted-foreground mb-6">
            Join our community of thousands of agent engineers and researchers to stay connected to the latest updates, tutorials, and more.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Discord</h3>
                  <p className="text-gray-400 text-sm">Join our community</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Connect with developers, get support, and stay updated on the latest features and announcements.
              </p>
              <Link href="https://discord.gg/jM3Z6M9uMq" target="_blank" rel="noopener noreferrer">
                <Button className="w-full hover:bg-blue-600 bg-blue-600/20 border-blue-500/30 text-blue-300" variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Discord
                </Button>
              </Link>
            </div>

            <div className="rounded-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">YouTube</h3>
                  <p className="text-gray-400 text-sm">Watch tutorials & demos</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our channel for tutorials, demos, and insights into building with Swarms.
              </p>
              <Link href="https://www.youtube.com/@kyegomez3242" target="_blank" rel="noopener noreferrer">
                <Button className="w-full hover:bg-red-600 bg-red-600/20 border-red-500/30 text-red-300" variant="outline" size="sm">
                  <Youtube className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </Link>
            </div>

            <div className="rounded-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center justify-center">
                  <Twitter className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Twitter/X</h3>
                  <p className="text-gray-400 text-sm">Follow for updates</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Stay in the loop with the latest news, updates, and insights from the Swarms team.
              </p>
              <Link href="https://x.com/swarms_corp" target="_blank" rel="noopener noreferrer">
                <Button className="w-full hover:bg-blue-500 bg-blue-500/20 border-blue-400/30 text-blue-300" variant="outline" size="sm">
                  <Twitter className="w-4 h-4 mr-2" />
                  Follow
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
