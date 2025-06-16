"use client";

import React, { useState } from 'react';
import { Atom, Blocks, Settings, User, Star, StarOff, MessageSquareMore, GripVertical, FileSpreadsheet, LockKeyhole, CircleGauge, LayoutDashboard, Trophy, Bookmark, Code2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useStarredApps } from '@/shared/components/starred-apps-context';
import { useRouter } from 'next/navigation';

const APPS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Your main control center.',
    icon: <LayoutDashboard size={32} className="text-emerald-500" />,
    category: 'Marketplace',
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Discover and use new tools, agents, and prompts.',
    icon: <Blocks size={32} className="text-blue-500" />,
    category: 'Marketplace',
  },
  {
    id: 'apps',
    title: 'Apps',
    description: 'Manage and customize your sidebar apps.',
    icon: <Atom size={32} className="text-gray-400" />,
    category: 'No Code Agent Platforms',
  },
  {
    id: 'chat',
    title: 'Chat',
    description: 'Converse with your agents and team.',
    icon: <MessageSquareMore size={32} className="text-indigo-500" />,
    category: 'No Code Agent Platforms',
  },
  {
    id: 'spreadsheet',
    title: 'Spreadsheet Swarm',
    description: 'Collaborative AI-powered spreadsheets.',
    icon: <FileSpreadsheet size={32} className="text-green-500" />,
    category: 'No Code Agent Platforms',
  },
  {
    id: 'dragndrop',
    title: 'Drag & Drop',
    description: 'Visual workflow builder.',
    icon: <GripVertical size={32} className="text-orange-500" />,
    category: 'No Code Agent Platforms',
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    description: 'Discover top creators and contributors.',
    icon: <Trophy size={32} className="text-yellow-500" />,
    category: 'Marketplace',
  },
  {
    id: 'apikeys',
    title: 'API Keys',
    description: 'Manage your API credentials.',
    icon: <LockKeyhole size={32} className="text-red-500" />,
    category: 'Account Settings',
  },
  {
    id: 'telemetry',
    title: 'Telemetry',
    description: 'Monitor platform usage and analytics.',
    icon: <CircleGauge size={32} className="text-cyan-500" />,
    category: 'Account Settings',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Account and organization settings.',
    icon: <Settings size={32} className="text-gray-400" />,
    category: 'Account Settings',
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your user profile.',
    icon: <User size={32} className="text-gray-400" />,
    category: 'More',
  },
  {
    id: 'bookmarks',
    title: 'Marketplace Bookmarks',
    description: 'Manage your bookmarks.',
    icon: <Bookmark size={32} className="text-gray-400" />,
    category: 'Marketplace',
  },
  {
    id: 'playground',
    title: 'Playground',
    description: 'Playground',
    icon: <Code2 size={32} className="text-gray-400" />,
    category: 'Account Settings',
  },
];

const CATEGORIES = [
  'Marketplace',
  'No Code Agent Platforms',
  'Account Settings',
  'More',
];

const TEMPLATES = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Marketplace, Leaderboard, Dashboard, Settings',
    icon: <Blocks size={28} className="text-blue-400" />,
    apps: ['dashboard', 'marketplace', 'leaderboard', 'settings', 'bookmarks'],
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
    apps: ['marketplace', 'leaderboard', 'dashboard', 'settings', 'chat', 'spreadsheet', 'dragndrop', 'settings', 'apikeys', 'telemetry', 'settings', 'profile', 'playground', 'bookmarks'],
  },
];

export default function AppsPage() {
  const { starred, toggleStar } = useStarredApps();
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
    <div className="min-h-screen bg-black text-white px-8 py-12 pb-60">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight bg-gradient-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent">Apps Gallery</h1>
        <p className="text-lg text-gray-400 mb-10">Choose which apps you want to see in your sidebar. Star your favorites to pin them for quick access.</p>
        <div className="mb-10">
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md bg-black text-white placeholder-gray-500 rounded-md px-4 py-3 focus:outline-none border border-transparent focus:border-transparent focus:ring-0 shadow-none"
            style={{
              borderWidth: '1px',
              borderImage: 'linear-gradient(90deg, #60a5fa 0%, #38bdf8 100%) 1',
              boxShadow: '0 0 0 1.5px rgba(56,189,248,0.18)',
              transition: 'box-shadow 0.3s, border-image 0.3s',
              animation: 'search-glow 1.2s infinite alternate',
            }}
            onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.32)'}
            onBlur={e => e.target.style.boxShadow = '0 0 0 1.5px rgba(56,189,248,0.18)'}
          />
        </div>

        {/* Templates Section */}
        <div className="mb-12">
          <div className="w-full flex items-center justify-center mb-6">
            <div className="w-full h-0.5 bg-gray-800 rounded-full opacity-80" />
          </div>
          <h2 className="text-2xl font-bold text-gray-200 mb-1">Quick Sidebar Templates</h2>
          <p className="text-gray-400 mb-6 text-base">Choose a template to quickly set up your sidebar with a curated set of apps for different workflows.</p>
          <div className="flex flex-col sm:flex-row gap-6 mb-8 w-full">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                className="flex-1 flex items-center gap-5 px-8 py-7 rounded-2xl border border-blue-800 bg-gradient-to-br from-black/60 to-blue-950/40 hover:from-blue-950/60 hover:to-black/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg group min-w-[240px] max-w-full"
                onClick={() => handleTemplateSelect(tpl.apps)}
                type="button"
                style={{ minHeight: '110px' }}
              >
                <span className="flex items-center justify-center w-20 h-14 rounded-md bg-blue-900/30 group-hover:bg-blue-800/40 transition-all border border-blue-700/30 shadow-inner">
                  {tpl.icon}
                </span>
                <span className="flex flex-col items-start justify-center text-left w-full">
                  <span className="font-bold text-xl text-gray-100 group-hover:text-blue-400 transition-all mb-1">{tpl.title}</span>
                  <span className="text-sm text-gray-400 leading-snug">{tpl.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {CATEGORIES.map((cat) => {
          const appsInCategory = filteredApps.filter((app) => app.category === cat);
          if (appsInCategory.length === 0) return null;
          return (
            <div key={cat} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-300 border-b border-gray-800 pb-2">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {appsInCategory.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    className={cn(
                      'relative flex flex-col items-start p-6 rounded-md border border-blue-700/60',
                      'bg-[rgba(15,20,30,0.85)] backdrop-blur-md shadow-lg',
                      'hover:shadow-[0_0_16px_2px_rgba(37,99,235,0.25)] hover:border-blue-500/80 transition-all duration-200',
                      'group cursor-pointer',
                      'overflow-hidden',
                    )}
                    style={{ boxShadow: '0 2px 24px 0 rgba(0,0,0,0.7), 0 0 0 1px #1e293b22' }}
                  >
                    <div className="flex items-center gap-4 mb-4 w-full">
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-blue-900/40 shadow-inner">
                        {app.icon}
                      </div>
                      <button
                        className="ml-auto rounded-full p-1 bg-black/30 border border-blue-700/40 hover:bg-blue-900/30 transition"
                        aria-label={starred.includes(app.id) ? 'Unstar app' : 'Star app'}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(app.id);
                        }}
                      >
                        {starred.includes(app.id) ? (
                          <Star size={28} className="text-blue-400 drop-shadow" fill="#60a5fa" />
                        ) : (
                          <StarOff size={28} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                    <h3 className="text-xl font-semibold mb-1 text-gray-100 tracking-wide drop-shadow-sm" style={{letterSpacing: '0.03em'}}>{app.title}</h3>
                    <p className="text-gray-400 mb-3 text-sm leading-relaxed min-h-[40px]">{app.description}</p>
                    <span className="text-xs uppercase tracking-widest text-blue-500 bg-blue-900/10 px-2 py-1 rounded shadow-sm mt-auto">{cat}</span>
                    <div className="absolute inset-0 pointer-events-none rounded-md border border-blue-700/10" style={{boxShadow:'0 0 32px 0 rgba(37,99,235,0.08)'}} />
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