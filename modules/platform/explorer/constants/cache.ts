const MINUTE = 60 * 1000;

export const CACHE_TIMES = {
  EXPLORER_DATA: {
    staleTime: 5 * MINUTE,
    gcTime: 10 * MINUTE,
  },

  TRENDING: {
    staleTime: 3 * MINUTE,
    gcTime: 8 * MINUTE,
  },

  USERS: {
    staleTime: 10 * MINUTE,
    gcTime: 15 * MINUTE,
  },

  REVIEWS: {
    staleTime: 5 * MINUTE,
    gcTime: 10 * MINUTE,
  },

  CATEGORIES: {
    staleTime: 15 * MINUTE,
    gcTime: 30 * MINUTE,
  },
} as const;


export const QUERY_OPTIONS = {
  explorerData: {
    refetchOnWindowFocus: false,
    staleTime: CACHE_TIMES.EXPLORER_DATA.staleTime,
    gcTime: CACHE_TIMES.EXPLORER_DATA.gcTime,
  },

  trending: {
    refetchOnWindowFocus: false,
    staleTime: CACHE_TIMES.TRENDING.staleTime,
    gcTime: CACHE_TIMES.TRENDING.gcTime,
  },

  users: {
    refetchOnWindowFocus: false,
    staleTime: CACHE_TIMES.USERS.staleTime,
    gcTime: CACHE_TIMES.USERS.gcTime,
  },

  reviews: {
    refetchOnWindowFocus: false,
    staleTime: CACHE_TIMES.REVIEWS.staleTime,
    gcTime: CACHE_TIMES.REVIEWS.gcTime,
  },

  categories: {
    refetchOnWindowFocus: false,
    staleTime: CACHE_TIMES.CATEGORIES.staleTime,
    gcTime: CACHE_TIMES.CATEGORIES.gcTime,
  },
} as const;
