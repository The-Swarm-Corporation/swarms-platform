"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const defaultStarred = ['dashboard', 'marketplace', 'registry', 'appstore', 'leaderboard', 'bookmarks'];
const StarredAppsContext = createContext({
  starred: defaultStarred,
  toggleStar: (id: string) => {},
  resetToDefaults: () => {},
});

export const StarredAppsProvider = ({ children }: { children: React.ReactNode }) => {
  const [starred, setStarred] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('starredApps');
      // If there's stored data, check if it's the old format (only 3 apps)
      if (stored) {
        const parsed = JSON.parse(stored);
        // If it's the old format with only 3 apps, migrate to new format
        if (parsed.length === 3 && parsed.includes('dashboard') && parsed.includes('marketplace') && parsed.includes('apps')) {
          localStorage.removeItem('starredApps');
          return defaultStarred;
        }
        return parsed;
      }
      return defaultStarred;
    }
    return defaultStarred;
  });

  useEffect(() => {
    localStorage.setItem('starredApps', JSON.stringify(starred));
  }, [starred]);

  const toggleStar = (id: string) => {
    setStarred((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const resetToDefaults = () => {
    localStorage.removeItem('starredApps');
    setStarred(defaultStarred);
  };

  return (
    <StarredAppsContext.Provider value={{ starred, toggleStar, resetToDefaults }}>
      {children}
    </StarredAppsContext.Provider>
  );
};

export const useStarredApps = () => useContext(StarredAppsContext); 