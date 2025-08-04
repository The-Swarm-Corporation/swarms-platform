"use client";

import React, { useState } from 'react';
import { Atom, Blocks, Settings, User, Star, StarOff, MessageSquareMore, GripVertical, FileSpreadsheet, LockKeyhole, CircleGauge, LayoutDashboard, Trophy, Bookmark, Code2, Store, Database } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useStarredApps } from '@/shared/components/starred-apps-context';
import { useRouter } from 'next/navigation';

type CategoryDescription = {
  title: string;
  description: string;
  forUsers: string;
};

type CategoryDescriptions = {
  [key in 'Marketplace' | 'No Code Agent Platforms' | 'Account Settings' | 'More']: CategoryDescription;
};

const CATEGORIES = ['Marketplace', 'No Code Agent Platforms', 'Account Settings', 'More'] as const;
type Category = typeof CATEGORIES[number];

const TEMPLATES = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Marketplace, Registry, App Store, Leaderboard, Dashboard, Settings',
    icon: <Blocks size={28} className="text-blue-400" />,
    apps: ['dashboard', 'marketplace', 'registry', 'appstore', 'leaderboard', 'settings', 'bookmarks'],
  },
  {
    id: 'no-code',
    title: 'No-Code Solutions',
    description: 'Dashboard, Chat, Spreadsheet, Drag n Drop, Settings',
    icon: <Atom size={28} className="text-emerald-400" />,
    apps: ['dashboard', 'chat', 'spreadsheet', 'dragndrop', 'settings'],
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'Dashboard, API Key, Telemetry, Settings, Playground',
    icon: <LockKeyhole size={28} className="text-red-400" />,
    apps: ['dashboard', 'apikeys', 'telemetry', 'settings', 'playground'],
  },
  {
    id: 'all',
    title: 'All',
    description: 'Activate all apps',
    icon: <Blocks size={28} className="text-blue-400" />,
    apps: ['marketplace', 'registry', 'appstore', 'leaderboard', 'dashboard', 'settings', 'chat', 'spreadsheet', 'dragndrop', 'settings', 'apikeys', 'telemetry', 'settings', 'profile', 'playground', 'bookmarks'],
  },
];

const CATEGORY_DESCRIPTIONS: CategoryDescriptions = {
  'Marketplace': {
    title: 'Marketplace',
    description: 'Discover, share, and monetize agents, prompts, and tools',
    forUsers: 'For creators, developers, and businesses looking to explore or share their agents',
  },
  'No Code Agent Platforms': {
    title: 'No Code Agent Platforms',
    description: 'Build and deploy agents without writing code',
    forUsers: 'For business users and non-technical teams who want to leverage agentic capabilities',
  },
  'Account Settings': {
    title: 'Account Settings',
    description: 'Manage your account, API keys, and platform settings',
    forUsers: 'For all users who need to configure their workspace and monitor usage',
  },
  'More': {
    title: 'Additional Tools',
    description: 'Extra utilities and personal settings',
    forUsers: 'For users looking to customize their experience and access supplementary features',
  },
};

const APPS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Your personalized command center for monitoring and managing all platform activities.',
    icon: <LayoutDashboard size={32} className="text-emerald-500" />,
    category: 'Marketplace',
    details: 'Track performance metrics, recent activity, and important notifications',
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Browse and discover agentic tools, agents, and prompts from the community.',
    icon: <Blocks size={32} className="text-blue-500" />,
    category: 'Marketplace',
    details: 'Find, purchase, or sell AI solutions and tools',
  },
  {
    id: 'registry',
    title: 'Registry',
    description: 'Search and explore all agents with advanced filtering and pagination.',
    icon: <Database size={32} className="text-blue-500" />,
    category: 'Marketplace',
    details: 'Comprehensive agent discovery with free/paid filtering',
  },
  {
    id: 'appstore',
    title: 'App Store',
    description: 'Explore curated autonomous AI applications ready for immediate use.',
    icon: <Store size={32} className="text-orange-500" />,
    category: 'Marketplace',
    details: 'Download and deploy pre-built AI applications',
  },
  {
    id: 'apps',
    title: 'Apps',
    description: 'Customize your workspace with the tools you need.',
    icon: <Atom size={32} className="text-gray-400" />,
    category: 'No Code Agent Platforms',
    details: 'Manage and organize your installed applications',
  },
  {
    id: 'chat',
    title: 'Chat',
    description: 'Interact with AI agents through a familiar chat interface.',
    icon: <MessageSquareMore size={32} className="text-indigo-500" />,
    category: 'No Code Agent Platforms',
    details: 'Real-time communication with AI agents and team members',
  },
  {
    id: 'spreadsheet',
    title: 'Spreadsheet Swarm',
    description: 'Collaborative AI-powered spreadsheets for data analysis.',
    icon: <FileSpreadsheet size={32} className="text-green-500" />,
    category: 'No Code Agent Platforms',
    details: 'Process and analyze data with AI assistance',
  },
  {
    id: 'dragndrop',
    title: 'Drag & Drop',
    description: 'Build AI workflows visually with our intuitive interface.',
    icon: <GripVertical size={32} className="text-orange-500" />,
    category: 'No Code Agent Platforms',
    details: 'Create custom AI workflows without coding',
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    description: 'See top performers and trending content in the community.',
    icon: <Trophy size={32} className="text-yellow-500" />,
    category: 'Marketplace',
    details: 'Track popular creators and trending AI solutions',
  },
  {
    id: 'apikeys',
    title: 'API Keys',
    description: 'Manage your API credentials and access tokens.',
    icon: <LockKeyhole size={32} className="text-red-500" />,
    category: 'Account Settings',
    details: 'Secure access to platform APIs and services',
  },
  {
    id: 'telemetry',
    title: 'Telemetry',
    description: 'Monitor platform usage and performance analytics.',
    icon: <CircleGauge size={32} className="text-cyan-500" />,
    category: 'Account Settings',
    details: 'Track usage metrics and system performance',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure your account and organization preferences.',
    icon: <Settings size={32} className="text-gray-400" />,
    category: 'Account Settings',
    details: 'Customize platform settings and preferences',
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your personal profile and preferences.',
    icon: <User size={32} className="text-gray-400" />,
    category: 'More',
    details: 'Update your profile information and settings',
  },
  {
    id: 'bookmarks',
    title: 'Marketplace Bookmarks',
    description: 'Access your saved items and favorites.',
    icon: <Bookmark size={32} className="text-purple-500" />,
    category: 'Marketplace',
    details: 'Quick access to saved agentic tools and content',
  },
  {
    id: 'playground',
    title: 'Playground',
    description: 'Experiment with AI models in a sandbox environment.',
    icon: <Code2 size={32} className="text-cyan-500" />,
    category: 'Account Settings',
    details: 'Test and debug AI models safely',
  },
];

export default function AppsPage() {
  const { starred, toggleStar, resetToDefaults } = useStarredApps();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredApps = APPS.filter(app =>
    app.title.toLowerCase().includes(search.toLowerCase()) ||
    app.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAppClick = (appId: string) => {
    switch (appId) {
      case 'dashboard':
        router.push('/platform/dashboard');
        break;
      case 'marketplace':
        router.push('/');
        break;
      case 'registry':
        router.push('/platform/registry');
        break;
      case 'appstore':
        router.push('/autonomous-apps');
        break;
      case 'apps':
        router.push('/apps');
        break;
      case 'chat':
        router.push('/platform/chat');
        break;
      case 'spreadsheet':
        router.push('/platform/spreadsheet');
        break;
      case 'dragndrop':
        router.push('/platform/dragndrop');
        break;
      case 'leaderboard':
        router.push('/platform/leaderboard');
        break;
      case 'apikeys':
        router.push('/platform/api-keys');
        break;
      case 'telemetry':
        router.push('/platform/telemetry');
        break;
      case 'settings':
        router.push('/platform/account');
        break;
      case 'profile':
        router.push('/platform/account/profile');
        break;
      case 'bookmarks':
        router.push('/bookmarks');
        break;
    }
  };

  const handleTemplateSelect = (templateApps: string[]) => {
    // Star all apps in the template, unstar others
    templateApps.forEach(appId => {
      if (!starred.includes(appId)) toggleStar(appId);
    });
    // Unstar apps not in the template
    starred.forEach(appId => {
      if (!templateApps.includes(appId)) toggleStar(appId);
    });
  };

  return (
    <div className="min-h-screen bg-[#000000] bg-gradient-to-b from-black via-black/95 to-black/90 text-white selection:bg-white/20">
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-gradient-radial from-white/[0.05] to-transparent rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="relative space-y-3 mb-12 sm:mb-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter text-white">Apps Gallery</h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl">Choose which apps you want to see in your sidebar. Star your favorites to pin them for quick access. Marketplace apps are selected by default.</p>
            </div>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reset to Marketplace
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-12 sm:mb-16">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] text-white placeholder-gray-400 rounded-2xl px-5 py-4 focus:outline-none border border-white/[0.06] hover:border-white/[0.12] focus:border-white/20 transition-all duration-200 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.06] focus:bg-white/[0.08]"
            />
          </div>
        </div>

        {/* Templates Section */}
        <div className="relative mb-16 sm:mb-20">
          <div className="border-t border-white/[0.06] pt-12 mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-white">Quick Sidebar Templates</h2>
            <p className="text-base sm:text-lg text-gray-300 mb-8">Choose a template to quickly set up your sidebar with a curated set of apps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                className="group flex flex-col gap-4 p-6 sm:p-8 rounded-2xl border border-white/[0.06] hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 ease-out text-left transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.06)]"
                onClick={() => handleTemplateSelect(tpl.apps)}
                type="button"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.06] group-hover:bg-white/[0.1] group-hover:scale-110 transition-all duration-300 ease-out">
                  {tpl.icon}
                </span>
                <div>
                  <span className="block font-semibold mb-2 text-white group-hover:text-white transition-colors">{tpl.title}</span>
                  <span className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors line-clamp-2">{tpl.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Apps Categories */}
        {CATEGORIES.map((cat: Category) => {
          const appsInCategory = filteredApps.filter((app) => app.category === cat);
          if (appsInCategory.length === 0) return null;
          const categoryInfo = CATEGORY_DESCRIPTIONS[cat];
          
          return (
            <div key={cat} className="relative mb-16 sm:mb-20 last:mb-0">
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-white">{categoryInfo.title}</h2>
                <p className="text-base text-gray-300 mb-2">{categoryInfo.description}</p>
                <p className="text-sm text-gray-400">{categoryInfo.forUsers}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {appsInCategory.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    className="group relative flex flex-col p-6 sm:p-8 rounded-2xl border border-white/[0.06] hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 ease-out cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.06)]"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.06] group-hover:bg-white/[0.1] group-hover:scale-110 transition-all duration-300 ease-out">
                        {app.icon}
                      </div>
                      <button
                        className="ml-auto -mt-1 -mr-1 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm"
                        aria-label={starred.includes(app.id) ? 'Unstar app' : 'Star app'}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(app.id);
                        }}
                      >
                        {starred.includes(app.id) ? (
                          <Star size={22} className="text-white transform hover:scale-110 active:scale-90 transition-transform duration-300" fill="currentColor" />
                        ) : (
                          <StarOff size={22} className="text-gray-300 hover:text-white transform hover:scale-110 active:scale-90 transition-all duration-300" />
                        )}
                      </button>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white group-hover:text-white transition-colors">{app.title}</h3>
                    <p className="text-base text-gray-300 group-hover:text-gray-200 transition-colors mb-4 line-clamp-2">{app.description}</p>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mt-auto">{app.details}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 