"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const defaultStarred = ['dashboard', 'marketplace', 'apps'];
const StarredAppsContext = createContext({
  starred: defaultStarred,
  toggleStar: (id: string) => {},
});

export const StarredAppsProvider = ({ children }: { children: React.ReactNode }) => {
  const [starred, setStarred] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('starredApps');
      return stored ? JSON.parse(stored) : defaultStarred;
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

  return (
    <StarredAppsContext.Provider value={{ starred, toggleStar }}>
      {children}
    </StarredAppsContext.Provider>
  );
};

export const useStarredApps = () => useContext(StarredAppsContext); 