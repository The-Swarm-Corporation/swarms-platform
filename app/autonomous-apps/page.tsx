'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, Rocket, X, Search, Calendar, Zap, AlertCircle, RefreshCcw, Maximize2, Minimize2, ExternalLink, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

const AUTONOMOUS_APPS = [
  {
    id: 'health',
    title: 'Health',
    description: 'Your personal healthcare assistant powered by AI',
    domain: 'mcsplatform.swarms.world',
    url: 'https://mcsplatform.swarms.world',
    icon: <Heart size={32} className="text-blue-500" />,
    color: 'blue',
  },
  {
    id: 'create',
    title: 'create',
    description: 'Multi-Agent Based Media Generation Engine',
    domain: 'createnow.xyz',
    url: 'https://createnow.xyz',
    icon: <Sparkles size={32} className="text-purple-500" />,
    color: 'purple',
  },
  {
    id: 'zap',
    title: 'Zap',
    description: 'Lightning-fast social payments on Solana',
    domain: 'v0-solana-social-pay-app.vercel.app',
    url: 'https://v0-solana-social-pay-app.vercel.app',
    icon: <Zap size={32} className="text-yellow-500" />,
    color: 'yellow',
  },
  {
    id: 'SSI',
    title: 'SSI.fun',
    description: 'Build, Deploy, and Tokenize your Applications on Solana',
    domain: 'ssi.fun',
    url: 'https://ssi.fun',
    icon: <Brain size={32} className="text-green-500" />,
    color: 'green',
  },
  
];

export default function AutonomousAppsPage() {
  const [selectedApp, setSelectedApp] = useState<typeof AUTONOMOUS_APPS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredApps = AUTONOMOUS_APPS.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Search Box */}
        <div className="mb-12">
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

          {/* Pre-built Apps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col p-6 rounded-lg border border-blue-800/30 bg-gradient-to-br from-black/60 to-blue-950/40 hover:from-blue-950/60 hover:to-black/80 transition-all duration-200 group cursor-pointer"
                onClick={() => setSelectedApp(app)}
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
                <div className="mt-auto">
                  <span className={`text-xs uppercase tracking-widest text-${app.color}-500 bg-${app.color}-900/10 px-2 py-1 rounded`}>
                    Pre-built App
                  </span>
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-lg border border-blue-700/10" style={{boxShadow:'0 0 32px 0 rgba(37,99,235,0.08)'}} />
              </motion.div>
            ))}
          </div>
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