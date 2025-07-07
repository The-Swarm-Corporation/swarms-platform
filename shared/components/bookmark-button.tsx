'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { addBookmark, removeBookmark, isBookmarked } from '@/shared/utils/bookmarks';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

interface BookmarkButtonProps {
  id: string;
  type: 'prompt' | 'agent' | 'tool' | 'user';
  name: string;
  description?: string;
  username?: string;
  created_at: string;
  tags?: string[];
  className?: string;
}

export default function BookmarkButton({
  id,
  type,
  name,
  description,
  username,
  created_at,
  tags,
  className = '',
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSaved(isBookmarked(id, type));
  }, [id, type]);

  const handleBookmark = () => {
    if (isSaved) {
      removeBookmark(id, type);
      setIsSaved(false);
      toast({
        title: 'Bookmark removed',
        description: `${name} has been removed from your bookmarks.`,
      });
    } else {
      const success = addBookmark({
        id,
        type,
        name,
        description,
        username,
        created_at,
        tags,
      });

      if (success) {
        setIsSaved(true);
        toast({
          title: 'Bookmark added',
          description: `${name} has been added to your bookmarks.`,
        });
      }
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleBookmark}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
        isSaved
          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
          : 'bg-black/50 text-white/60 border border-gray-800 hover:bg-white/5 hover:text-white/80'
      } ${className}`}
      aria-label={isSaved ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-yellow-400' : ''}`} />
      <span className="text-sm font-medium">
        {isSaved ? 'Bookmarked' : 'Bookmark'}
      </span>
    </motion.button>
  );
}