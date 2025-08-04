"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Default to only marketplace apps
const defaultStarred = ['dashboard', 'marketplace', 'registry', 'appstore', 'leaderboard', 'bookmarks'];
const STARRED_APPS_VERSION = '2.0'; // Version to track marketplace-only defaults

const StarredAppsContext = createContext({
  starred: defaultStarred,
  toggleStar: (id: string) => {},
  resetToDefaults: () => {},
});

export const StarredAppsProvider = ({ children }: { children: React.ReactNode }) => {
  const [starred, setStarred] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('starredApps');
      const versionStored = localStorage.getItem('starredAppsVersion');
      
      // If version doesn't match, force reset to new defaults
      if (versionStored !== STARRED_APPS_VERSION) {
        localStorage.removeItem('starredApps');
        localStorage.setItem('starredAppsVersion', STARRED_APPS_VERSION);
        return defaultStarred;
      }
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Check if this is an array and has valid data
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (error) {
          // If parsing fails, reset to defaults
          localStorage.removeItem('starredApps');
          return defaultStarred;
        }
      }
      return defaultStarred;
    }
    return defaultStarred;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('starredApps', JSON.stringify(starred));
      localStorage.setItem('starredAppsVersion', STARRED_APPS_VERSION);
    }
  }, [starred]);

  const toggleStar = (id: string) => {
    setStarred((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const resetToDefaults = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('starredApps');
      localStorage.setItem('starredAppsVersion', STARRED_APPS_VERSION);
    }
    setStarred(defaultStarred);
  };

  return (
    <StarredAppsContext.Provider value={{ starred, toggleStar, resetToDefaults }}>
      {children}
    </StarredAppsContext.Provider>
  );
};

export const useStarredApps = () => useContext(StarredAppsContext); 