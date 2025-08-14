'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Link from 'next/link';
import InfoCard from '@/modules/platform/explorer/components/info-card';
import { Code, Hammer, MessageSquare, User as UserIcon } from 'lucide-react';

interface Bookmark {
  id: string;
  type: 'prompt' | 'agent' | 'tool' | 'user';
  name: string;
  description?: string;
  username?: string;
  created_at: string;
  tags?: string[];
}

type ItemType = 'prompt' | 'agent' | 'tool';

type EnrichedItem = {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  user_id?: string;
  is_free?: boolean;
  price_usd?: number | null;
  tags?: string[];
  usecases?: { title: string; description: string }[];
  requirements?: Array<{ package: string; installation: string }> | string | undefined;
  itemType: ItemType;
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'prompt' | 'agent' | 'tool' | 'user'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [enrichedMap, setEnrichedMap] = useState<Record<string, EnrichedItem>>({});

  useEffect(() => {
    // Load bookmarks from localStorage
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const fetchFor = async (b: Bookmark) => {
          if (b.type === 'user') return null;
          const base = b.type === 'prompt' ? '/api/get-prompts/' : b.type === 'agent' ? '/api/get-agents/' : '/api/get-tools/';
          const res = await fetch(`${base}${b.id}`);
          if (!res.ok) return null;
          const data = await res.json();
          const enriched: EnrichedItem = {
            id: data.id,
            name: data.name || b.name,
            description: data.description || b.description || '',
            image_url: data.image_url,
            user_id: data.user_id,
            is_free: data.is_free,
            price_usd: typeof data.price_usd === 'number' ? data.price_usd : null,
            tags: (data.tags && typeof data.tags === 'string') ? data.tags.split(',') : b.tags,
            usecases: data.use_cases || data.usecases,
            requirements: data.requirements,
            itemType: b.type as ItemType,
          };
          return enriched;
        };

        const results = await Promise.all(bookmarks.map(fetchFor));
        const map: Record<string, EnrichedItem> = {};
        results.forEach((item) => {
          if (item) map[item.id] = item;
        });
        setEnrichedMap(map);
      } catch (e) {
        // Ignore errors; fallback UI still works
      } finally {
        setLoading(false);
      }
    };

    if (bookmarks.length > 0) {
      loadDetails();
    } else {
      setEnrichedMap({});
      setLoading(false);
    }
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      const matchesSearch =
        bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || bookmark.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [bookmarks, searchQuery, selectedType]);

  const removeBookmark = (id: string) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== id);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    setEnrichedMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const iconForType = (type: ItemType) => {
    switch (type) {
      case 'agent':
        return <Code />;
      case 'tool':
        return <Hammer />;
      default:
        return <MessageSquare />;
    }
  };

  const linkFor = (type: ItemType, id: string) => {
    if (type === 'agent') return `/agent/${id}`;
    if (type === 'tool') return `/tool/${id}`;
    return `/prompt/${id}`;
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
          {filteredBookmarks.map((b, index) => {
            const enriched = enrichedMap[b.id];
            if (b.type === 'user') {
              return (
                <motion.article
                  key={b.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative rounded-md overflow-hidden shadow-lg border border-gray-800 bg-white/5 backdrop-blur-lg p-6 hover:bg-white/10 transition-all duration-200"
                >
                  <Link href={`/users/${b.id}`} className="block">
                    <div className="flex items-center gap-3 mb-3">
                      <UserIcon className="h-5 w-5 text-[#9B59B6]" />
                      <span className="text-xs uppercase tracking-wider font-medium text-[#9B59B6]">user</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{b.name}</h3>
                    <p className="text-white/70 mb-3 line-clamp-2 text-sm">{b.description || 'No description provided'}</p>
                  </Link>
                  <button
                    onClick={() => removeBookmark(b.id)}
                    className="absolute top-2 right-2 p-2 text-white/60 hover:text-white/90 transition-colors"
                    aria-label="Remove bookmark"
                  >
                    ×
                  </button>
                </motion.article>
              );
            }

            if (loading || !enriched) {
              return (
                <div key={`${b.id}-${index}`} className="h-[340px] rounded-xl border border-zinc-700/50 bg-zinc-800/20 animate-pulse" />
              );
            }

            const itemType = enriched.itemType;
            return (
              <div key={`${b.id}-${index}`} className="flex flex-col w-full">
                <InfoCard
                  id={enriched.id}
                  title={enriched.name}
                  description={enriched.description}
                  imageUrl={enriched.image_url}
                  icon={iconForType(itemType)}
                  className="w-full h-full"
                  link={linkFor(itemType, enriched.id)}
                  userId={enriched.user_id}
                  is_free={enriched.is_free}
                  price_usd={enriched.price_usd ?? undefined}
                  tags={enriched.tags}
                  usecases={enriched.usecases}
                  requirements={enriched.requirements as any}
                  itemType={itemType}
                  usersMap={{}}
                  reviewsMap={{}}
                />
                <button
                  onClick={() => removeBookmark(b.id)}
                  className="mt-2 self-end text-white/60 hover:text-white/90 text-sm"
                  aria-label="Remove bookmark"
                >
                  Remove
                </button>
              </div>
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