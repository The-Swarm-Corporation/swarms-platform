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
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Rocket size={32} className="text-white" />
          <div>
            <h1 className="text-3xl font-bold mb-1">
              App Store
            </h1>
            <p className="text-sm text-gray-400">
              Discover and launch autonomous applications
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 space-y-4">
          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-[#333333] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                  selectedCategory === category.id
                    ? "bg-white text-black"
                    : "bg-[#111111] text-gray-300 hover:bg-[#222222] border border-[#333333]"
                )}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mb-12 p-6 rounded-md bg-[#111111] border border-[#333333]">
          <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
          <p className="text-gray-400 text-sm">
            The ability to create your own autonomous applications is coming soon. Stay tuned for updates!
          </p>
        </div>

        {/* Featured Apps Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Featured Apps</h2>
              <p className="text-sm text-gray-400">Apps created by our team to showcase the power of autonomous AI</p>
            </div>
            <a
              href="https://cal.com/swarms"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Calendar size={18} />
              <span>Launch Your App</span>
            </a>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col p-6 rounded-md border border-[#333333] bg-[#111111] hover:bg-[#161616] transition-all duration-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[#222222] border border-[#333333]">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{app.title}</h3>
                    <p className="text-xs text-gray-400">{app.domain}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4">{app.description}</p>
                
                {/* Category Badge */}
                <div className="mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#222222] text-gray-300 border border-[#333333]">
                    {app.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => openInfoModal(app)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#222222] hover:bg-[#333333] rounded-md transition-colors text-sm"
                  >
                    <Info size={16} />
                    <span>Learn More</span>
                  </button>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-black hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
                  >
                    <Play size={16} />
                    <span>Launch</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No apps found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* App Store CTA */}
        <div className="p-8 rounded-md bg-[#111111] border border-[#333333] text-center">
          <h2 className="text-xl font-semibold text-white mb-3">Want to Launch Your App?</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
            Join our growing ecosystem of autonomous AI applications. Book a call with our team to discuss launching your app in the Swarms App Store.
          </p>
          <a
            href="https://cal.com/swarms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
          >
            <Calendar size={18} />
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
                className="relative bg-[#111111] rounded-md border border-[#333333] overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-[#333333]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[#222222] border border-[#333333]">
                        {infoApp.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">{infoApp.title}</h2>
                        <p className="text-sm text-gray-400">{infoApp.domain}</p>
                      </div>
                    </div>
                    <button
                      onClick={closeInfoModal}
                      className="p-2 hover:bg-[#222222] rounded-md transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#222222] text-gray-300 border border-[#333333]">
                      {infoApp.category}
                    </span>
                    <span className="text-xs text-gray-500">Pre-built App</span>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">About</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{infoApp.longDescription}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {infoApp.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-1 h-1 bg-white rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {infoApp.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#222222] text-gray-300 text-xs rounded-full border border-[#333333]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-[#333333] flex gap-3">
                  <button
                    onClick={() => launchApp(infoApp)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
                  >
                    <Play size={18} />
                    <span>Launch App</span>
                  </button>
                  <button
                    onClick={() => window.open(infoApp.url, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#222222] hover:bg-[#333333] rounded-md transition-colors text-sm"
                  >
                    <ExternalLink size={18} />
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
                  "relative bg-black rounded-md border border-[#333333] overflow-hidden",
                  isMaximized ? "w-full h-full" : "w-full max-w-6xl h-[80vh]"
                )}
                onClick={e => e.stopPropagation()}
              >
                {/* App Header */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-[#111111] border-b border-[#333333] flex items-center justify-between px-4 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#222222] border border-[#333333]">
                      {selectedApp.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{selectedApp.title}</h3>
                      <p className="text-xs text-gray-400">{selectedApp.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openInNewTab}
                      className="p-2 hover:bg-[#222222] rounded-md transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={18} className="text-gray-400" />
                    </button>
                    <button
                      onClick={toggleMaximize}
                      className="p-2 hover:bg-[#222222] rounded-md transition-colors"
                      title={isMaximized ? "Restore" : "Maximize"}
                    >
                      {isMaximized ? (
                        <Minimize2 size={18} className="text-gray-400" />
                      ) : (
                        <Maximize2 size={18} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-[#222222] rounded-md transition-colors"
                      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 size={18} className="text-gray-400" />
                      ) : (
                        <Maximize2 size={18} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="p-2 hover:bg-[#222222] rounded-md transition-colors"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-400">Loading {selectedApp.title}...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 p-6 bg-[#111111] rounded-md border border-[#333333]">
                      <AlertCircle size={24} className="text-gray-400" />
                      <p className="text-sm text-gray-300 text-center">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
                      >
                        <RefreshCcw size={18} />
                        <span>Retry</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* App Content */}
                <iframe
                  ref={iframeRef}
                  src={selectedApp.url}
                  className="w-full h-full mt-12"
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