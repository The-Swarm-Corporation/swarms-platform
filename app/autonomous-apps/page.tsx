'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, Rocket, X, Search, Calendar, Zap, AlertCircle, RefreshCcw, Maximize2, Minimize2, ExternalLink, Brain, ChartBarIncreasing, Play, Info, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

const AUTONOMOUS_APPS = [
  {
    id: 'health',
    title: 'Health',
    description: 'Your personal healthcare assistant powered by AI',
    longDescription: 'A comprehensive healthcare platform that provides personalized medical advice, symptom analysis, and health monitoring. Features include AI-powered diagnosis, medication reminders, and integration with wearable devices.',
    domain: 'mcsplatform.swarms.world',
    url: 'https://mcsplatform.swarms.world',
    icon: <Heart size={32} className="text-blue-500" />,
    color: 'blue',
    category: 'Healthcare',
    features: ['AI Diagnosis', 'Health Monitoring', 'Medication Reminders', 'Wearable Integration'],
    tags: ['medical', 'ai', 'healthcare', 'wellness']
  },
  {
    id: 'create',
    title: 'create',
    description: 'Multi-Agent Based Media Generation Engine',
    longDescription: 'An advanced content creation platform that uses multiple AI agents to generate high-quality media content. From text to images, videos, and interactive content, this platform revolutionizes digital content creation.',
    domain: 'createnow.xyz',
    url: 'https://createnow.xyz',
    icon: <Sparkles size={32} className="text-purple-500" />,
    color: 'purple',
    category: 'Content Creation',
    features: ['Multi-Agent AI', 'Media Generation', 'Content Automation', 'Creative Tools'],
    tags: ['content', 'ai', 'media', 'creation']
  },
  {
    id: 'zap',
    title: 'Zap',
    description: 'Lightning-fast social payments on Solana',
    longDescription: 'A decentralized payment platform built on Solana blockchain that enables instant, low-cost transactions. Perfect for social payments, tipping, and micro-transactions with enhanced security and transparency.',
    domain: 'v0-solana-social-pay-app.vercel.app',
    url: 'https://v0-solana-social-pay-app.vercel.app',
    icon: <Zap size={32} className="text-yellow-500" />,
    color: 'yellow',
    category: 'Finance',
    features: ['Instant Payments', 'Low Fees', 'Blockchain Security', 'Social Integration'],
    tags: ['crypto', 'payments', 'solana', 'finance']
  },
  {
    id: 'SSI',
    title: 'SSI.fun',
    description: 'Build, Deploy, and Tokenize your Applications on Solana',
    longDescription: 'A comprehensive platform for building, deploying, and monetizing applications on the Solana blockchain. Includes tools for smart contract development, token creation, and application deployment.',
    domain: 'ssi.fun',
    url: 'https://ssi.fun',
    icon: <Brain size={32} className="text-green-500" />,
    color: 'green',
    category: 'Development',
    features: ['Smart Contracts', 'Token Creation', 'App Deployment', 'Blockchain Tools'],
    tags: ['blockchain', 'development', 'solana', 'defi']
  },
  {
    id: 'WhiteRock',
    title: 'WhiteRock',
    description: 'Cursor for Equity Analysis',
    longDescription: 'An AI-powered financial analysis platform that provides deep insights into equity markets. Features include real-time data analysis, predictive modeling, and comprehensive reporting tools for investment decisions.',
    domain: 'whiterock.swarms.world',
    url: 'https://whiterock.swarms.world',
    icon: <ChartBarIncreasing size={32} className="text-green-500" />,
    color: 'green',
    category: 'Finance',
    features: ['Equity Analysis', 'Real-time Data', 'Predictive Modeling', 'Investment Insights'],
    tags: ['finance', 'analysis', 'investment', 'ai']
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Apps', count: AUTONOMOUS_APPS.length },
  { id: 'healthcare', name: 'Healthcare', count: AUTONOMOUS_APPS.filter(app => app.category === 'Healthcare').length },
  { id: 'content-creation', name: 'Content Creation', count: AUTONOMOUS_APPS.filter(app => app.category === 'Content Creation').length },
  { id: 'finance', name: 'Finance', count: AUTONOMOUS_APPS.filter(app => app.category === 'Finance').length },
  { id: 'development', name: 'Development', count: AUTONOMOUS_APPS.filter(app => app.category === 'Development').length },
];

export default function AutonomousAppsPage() {
  const [selectedApp, setSelectedApp] = useState<typeof AUTONOMOUS_APPS[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoApp, setInfoApp] = useState<typeof AUTONOMOUS_APPS[0] | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredApps = AUTONOMOUS_APPS.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      app.category.toLowerCase().replace(' ', '-') === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (selectedApp) {
      setIsLoading(true);
      setError(null);
    }
  }, [selectedApp]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load the application. Please try again.');
    setIsLoading(false);
  };

  const handleRetry = () => {
    if (selectedApp && iframeRef.current) {
      setIsLoading(true);
      setError(null);
      iframeRef.current.src = selectedApp.url;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const openInNewTab = () => {
    if (selectedApp) {
      window.open(selectedApp.url, '_blank');
    }
  };

  const openInfoModal = (app: typeof AUTONOMOUS_APPS[0]) => {
    setInfoApp(app);
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
    setInfoApp(null);
  };

  const launchApp = (app: typeof AUTONOMOUS_APPS[0]) => {
    setSelectedApp(app);
    closeInfoModal();
  };

  return (
    <div className="min-h-screen bg-black text-white px-8 py-12 pb-60">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Rocket size={40} className="text-blue-500" />
          <div>
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight bg-gradient-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent">
              App Store
            </h1>
            <p className="text-lg text-gray-400">
              Autonomous Apps You Love
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 space-y-6">
          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/50 border border-blue-800/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-400 text-sm">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50"
                )}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mb-12 p-6 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">Coming Soon</h2>
          <p className="text-gray-300">
            The ability to create your own autonomous applications is coming soon. Stay tuned for updates!
          </p>
        </div>

        {/* Featured Apps Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-200 mb-2">Featured Apps</h2>
              <p className="text-gray-400">Apps created by our team to showcase the power of autonomous AI</p>
            </div>
            <a
              href="https://cal.com/swarms"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Calendar size={20} />
              <span>Launch Your App</span>
            </a>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col p-6 rounded-lg border border-blue-800/30 bg-gradient-to-br from-black/60 to-blue-950/40 hover:from-blue-950/60 hover:to-black/80 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-blue-900/40 shadow-inner">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">{app.title}</h3>
                    <p className="text-sm text-gray-400">{app.domain}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{app.description}</p>
                
                {/* Category Badge */}
                <div className="mb-4">
                  <span className={`text-xs uppercase tracking-widest text-${app.color}-500 bg-${app.color}-900/10 px-2 py-1 rounded`}>
                    {app.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => openInfoModal(app)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-sm"
                  >
                    <Info size={16} />
                    <span>Learn More</span>
                  </button>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                  >
                    <Play size={16} />
                    <span>Launch</span>
                  </button>
                </div>
                
                <div className="absolute inset-0 pointer-events-none rounded-lg border border-blue-700/10" style={{boxShadow:'0 0 32px 0 rgba(37,99,235,0.08)'}} />
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No apps found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* App Store CTA */}
        <div className="p-8 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 text-center">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Want to Launch Your App?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join our growing ecosystem of autonomous AI applications. Book a call with our team to discuss launching your app in the Swarms App Store.
          </p>
          <a
            href="https://cal.com/swarms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-lg font-semibold"
          >
            <Calendar size={24} />
            <span>Book a Call</span>
          </a>
        </div>

        {/* Info Modal */}
        <AnimatePresence>
          {showInfoModal && infoApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeInfoModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-gray-900 rounded-lg border border-blue-800/30 overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-blue-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-800/80 to-gray-700/80 border border-blue-900/40">
                        {infoApp.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-100">{infoApp.title}</h2>
                        <p className="text-gray-400">{infoApp.domain}</p>
                      </div>
                    </div>
                    <button
                      onClick={closeInfoModal}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={24} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs uppercase tracking-widest text-${infoApp.color}-500 bg-${infoApp.color}-900/10 px-2 py-1 rounded`}>
                      {infoApp.category}
                    </span>
                    <span className="text-xs text-gray-500">Pre-built App</span>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">About</h3>
                    <p className="text-gray-300 leading-relaxed">{infoApp.longDescription}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {infoApp.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {infoApp.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-blue-800/30 flex gap-3">
                  <button
                    onClick={() => launchApp(infoApp)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
                  >
                    <Play size={20} />
                    <span>Launch App</span>
                  </button>
                  <button
                    onClick={() => window.open(infoApp.url, '_blank')}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <ExternalLink size={20} />
                    <span>Open in New Tab</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Modal */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedApp(null)}
            >
              <motion.div
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={cn(
                  "relative bg-black rounded-lg border border-blue-800/30 overflow-hidden",
                  isMaximized ? "w-full h-full" : "w-full max-w-6xl h-[80vh]"
                )}
                onClick={e => e.stopPropagation()}
              >
                {/* App Header */}
                <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-blue-800/30 flex items-center justify-between px-4 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-blue-900/40">
                      {selectedApp.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-100">{selectedApp.title}</h3>
                      <p className="text-xs text-gray-400">{selectedApp.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openInNewTab}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={20} className="text-gray-400" />
                    </button>
                    <button
                      onClick={toggleMaximize}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={isMaximized ? "Restore" : "Maximize"}
                    >
                      {isMaximized ? (
                        <Minimize2 size={20} className="text-gray-400" />
                      ) : (
                        <Maximize2 size={20} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 size={20} className="text-gray-400" />
                      ) : (
                        <Maximize2 size={20} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-400">Loading {selectedApp.title}...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 p-6 bg-gray-900/80 rounded-lg border border-red-500/30">
                      <AlertCircle size={32} className="text-red-500" />
                      <p className="text-gray-300 text-center">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <RefreshCcw size={20} />
                        <span>Retry</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* App Content */}
                <iframe
                  ref={iframeRef}
                  src={selectedApp.url}
                  className="w-full h-full mt-14"
                  style={{ border: 'none' }}
                  title={selectedApp.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 