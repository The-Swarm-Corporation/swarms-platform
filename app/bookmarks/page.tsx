'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code, MessageSquare, Wrench, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Bookmark {
  id: string;
  type: 'prompt' | 'agent' | 'tool' | 'user';
  name: string;
  description?: string;
  username?: string;
  created_at: string;
  tags?: string[];
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'prompt' | 'agent' | 'tool' | 'user'>('all');

  useEffect(() => {
    // Load bookmarks from localStorage
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  }, []);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || bookmark.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const removeBookmark = (id: string) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== id);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  };

  const getItemColors = (type: string) => {
    switch (type) {
      case 'prompt':
        return {
          icon: 'text-[#FF6B6B]',
          bg: 'bg-[#FF6B6B]/5',
          border: 'border-[#FF6B6B]/20',
          hover: 'hover:bg-[#FF6B6B]/10'
        };
      case 'agent':
        return {
          icon: 'text-[#4ECDC4]',
          bg: 'bg-[#4ECDC4]/5',
          border: 'border-[#4ECDC4]/20',
          hover: 'hover:bg-[#4ECDC4]/10'
        };
      case 'tool':
        return {
          icon: 'text-[#FFD93D]',
          bg: 'bg-[#FFD93D]/5',
          border: 'border-[#FFD93D]/20',
          hover: 'hover:bg-[#FFD93D]/10'
        };
      case 'user':
        return {
          icon: 'text-[#9B59B6]',
          bg: 'bg-[#9B59B6]/5',
          border: 'border-[#9B59B6]/20',
          hover: 'hover:bg-[#9B59B6]/10'
        };
      default:
        return {
          icon: 'text-white',
          bg: 'bg-white/5',
          border: 'border-white/20',
          hover: 'hover:bg-white/10'
        };
    }
  };

  return (
    <main className="min-h-screen bg-black pb-24 w-full">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Bookmarks</h1>
          <p className="text-gray-400">Your saved items and users</p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'prompt', 'agent', 'tool', 'user'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bookmarks Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBookmarks.map((bookmark, index) => {
            const colors = getItemColors(bookmark.type);
            let href = '#';
            if (bookmark.type === 'user') {
              href = `/users/${bookmark.id}`;
            } else if (bookmark.type === 'prompt') {
              href = `/prompt/${bookmark.id}`;
            } else if (bookmark.type === 'agent') {
              href = `/agent/${bookmark.id}`;
            } else if (bookmark.type === 'tool') {
              href = `/tool/${bookmark.id}`;
            }
            return (
              <motion.article
                key={bookmark.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`group relative rounded-md overflow-hidden shadow-lg border border-gray-800 ${colors.bg} backdrop-blur-lg p-6 ${colors.hover} transition-all duration-200`}
              >
                <Link
                  href={href}
                  className="block"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {bookmark.type === 'prompt' ? (
                      <MessageSquare className={`h-5 w-5 ${colors.icon}`} />
                    ) : bookmark.type === 'agent' ? (
                      <Code className={`h-5 w-5 ${colors.icon}`} />
                    ) : bookmark.type === 'tool' ? (
                      <Wrench className={`h-5 w-5 ${colors.icon}`} />
                    ) : (
                      <User className={`h-5 w-5 ${colors.icon}`} />
                    )}
                    <span className={`text-xs uppercase tracking-wider font-medium ${colors.icon}`}>
                      {bookmark.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{bookmark.name}</h3>
                  <p className="text-white/70 mb-3 line-clamp-2 text-sm">
                    {bookmark.description || 'No description provided'}
                  </p>
                  {bookmark.username && (
                    <p className="text-white/60 text-sm mb-3">by {bookmark.username}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <time className="text-xs text-white/60" dateTime={bookmark.created_at}>
                      {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                    </time>
                  </div>
                </Link>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="absolute top-2 right-2 p-2 text-white/60 hover:text-white/90 transition-colors"
                  aria-label="Remove bookmark"
                >
                  ×
                </button>
              </motion.article>
            );
          })}
        </motion.div>

        {filteredBookmarks.length === 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center text-white/70 py-12"
          >
            No bookmarks found
          </motion.div>
        )}
      </div>
    </main>
  );
} 