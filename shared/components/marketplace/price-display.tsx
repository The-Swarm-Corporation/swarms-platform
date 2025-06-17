'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { Loader2 } from 'lucide-react';

// Simple SOL price fetching function
async function getSolPrice(): Promise<number> {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_COIN_GECKO_API ||
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    );
    const data = await response.json();
    return data.solana?.usd || 100; // Fallback to $100
  } catch (error) {
    console.error('Failed to fetch SOL price:', error);
    return 100; // Fallback price
  }
}

async function solToUsd(solAmount: number): Promise<number> {
  const solPrice = await getSolPrice();
  return solAmount * solPrice;
}

interface PriceDisplayProps {
  solAmount: number;
  showUSD?: boolean;
  showSOL?: boolean;
  className?: string;
  solDecimals?: number;
  usdDecimals?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'premium' | 'compact';
  loading?: boolean;
}

export default function PriceDisplay({
  solAmount,
  showUSD = true,
  showSOL = true,
  className,
  solDecimals = 4,
  usdDecimals = 2,
  size = 'md',
  variant = 'default',
  loading: externalLoading = false,
}: PriceDisplayProps) {
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUsdPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        const usd = await solToUsd(solAmount);

        if (mounted) {
          setUsdAmount(usd);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch price',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (showUSD && solAmount > 0) {
      fetchUsdPrice();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [solAmount, showUSD]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-lg font-semibold';
      default:
        return 'text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full';
      case 'compact':
        return 'text-muted-foreground';
      default:
        return '';
    }
  };

  if ((loading || externalLoading) && showUSD) {
    return (
      <div
        className={cn('flex items-center gap-1', getSizeClasses(), className)}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error && showUSD) {
    return (
      <div
        className={cn('flex items-center gap-1', getSizeClasses(), className)}
      >
        {showSOL && <span>{solAmount.toFixed(solDecimals)} SOL</span>}
        <span className="text-muted-foreground">(USD unavailable)</span>
      </div>
    );
  }

  const formatDisplay = () => {
    if (showSOL && showUSD && usdAmount !== null) {
      return `${solAmount.toFixed(solDecimals)} SOL (~$${usdAmount.toFixed(usdDecimals)})`;
    } else if (showSOL) {
      return `${solAmount.toFixed(solDecimals)} SOL`;
    } else if (showUSD && usdAmount !== null) {
      return `$${usdAmount.toFixed(usdDecimals)}`;
    }
    return '';
  };

  return (
    <span className={cn(getSizeClasses(), getVariantClasses(), className)}>
      {formatDisplay()}
    </span>
  );
}

// Premium badge component for marketplace items (USD only)
export function PremiumPriceBadge({
  solAmount,
  className,
}: {
  solAmount: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-xs font-semibold',
        className,
      )}
    >
      <span>💎</span>
      <PriceDisplay
        solAmount={solAmount}
        showSOL={false}
        showUSD={true}
        size="sm"
        variant="compact"
        className="text-white"
      />
    </div>
  );
}

// USD-only price display for cards
export function USDPriceDisplay({
  solAmount,
  className,
}: {
  solAmount: number;
  className?: string;
}) {
  return (
    <PriceDisplay
      solAmount={solAmount}
      showSOL={false}
      showUSD={true}
      size="sm"
      className={className}
    />
  );
}

// Compact price display for cards
export function CompactPriceDisplay({
  solAmount,
  className,
}: {
  solAmount: number;
  className?: string;
}) {
  return (
    <PriceDisplay
      solAmount={solAmount}
      size="sm"
      variant="compact"
      className={className}
    />
  );
}

// Large price display for purchase modals
export function LargePriceDisplay({
  solAmount,
  className,
}: {
  solAmount: number;
  className?: string;
}) {
  return <PriceDisplay solAmount={solAmount} size="lg" className={className} />;
}

// Hook for getting live SOL price
export function useSolPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentPrice = await getSolPrice();

        if (mounted) {
          setPrice(currentPrice);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch price',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPrice();

    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { price, loading, error };
}

// Hook for converting SOL to USD
export function useSolToUsd(solAmount: number) {
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const convertToUsd = async () => {
      try {
        setLoading(true);
        setError(null);
        const usd = await solToUsd(solAmount);

        if (mounted) {
          setUsdAmount(usd);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to convert price',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (solAmount > 0) {
      convertToUsd();
    } else {
      setLoading(false);
      setUsdAmount(0);
    }

    return () => {
      mounted = false;
    };
  }, [solAmount]);

  return { usdAmount, loading, error };
}
