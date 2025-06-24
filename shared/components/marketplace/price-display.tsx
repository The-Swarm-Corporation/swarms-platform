'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { Loader2 } from 'lucide-react';

async function getSolPrice(): Promise<number> {
  try {
    const response = await fetch('/api/sol-price', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.price || 100;
  } catch (error) {
    console.error('Failed to fetch SOL price:', error);
    return 100;
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
  variant?: 'default' | 'premium' | 'compact' | 'button';
  loading?: boolean;
  showBracket?: boolean;
}

export default function PriceDisplay({
  solAmount,
  showUSD = true,
  showSOL = true,
  className,
  solDecimals,
  usdDecimals = 2,
  size = 'md',
  variant = 'default',
  showBracket = false,
  loading: externalLoading = false,
}: PriceDisplayProps) {
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOptimalDecimals = (amount: number, defaultDecimals: number) => {
    if (amount === 0) return 1;
    if (amount < 0.0001) return 8;
    if (amount < 0.01) return 6;
    return defaultDecimals || 4;
  };

  // Smart number formatting that removes trailing zeros
  const formatNumber = (amount: number, decimals: number) => {
    return parseFloat(amount.toFixed(decimals)).toString();
  };

  const actualSolDecimals = solDecimals ?? getOptimalDecimals(solAmount, 4);

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
        console.warn('Price fetch failed, using fallback:', err);
        if (mounted) {
          const fallbackUsd = solAmount * 100;
          setUsdAmount(fallbackUsd);
          setError(null);
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
      </div>
    );
  }

  if (error && showUSD) {
    return (
      <div
        className={cn('flex items-center gap-1', getSizeClasses(), className)}
      >
        {showSOL && (
          <span>{formatNumber(solAmount, actualSolDecimals)} SOL</span>
        )}
        <span className="text-muted-foreground">(USD unavailable)</span>
      </div>
    );
  }

  const formatDisplay = () => {
    if (showSOL && showUSD && usdAmount !== null) {
      return `${formatNumber(solAmount, actualSolDecimals)} SOL (~$${usdAmount.toFixed(usdDecimals)})`;
    } else if (showSOL) {
      return `${formatNumber(solAmount, actualSolDecimals)} SOL`;
    } else if (showBracket && showUSD && usdAmount !== null) {
      return `[$${usdAmount.toFixed(usdDecimals)}]`;
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

export function USDPriceDisplay({
  solAmount,
  className,
  showBracket = true,
}: {
  solAmount: number;
  className?: string;
  showBracket?: boolean;
}) {
  return (
    <PriceDisplay
      solAmount={solAmount}
      showSOL={false}
      showUSD
      showBracket={showBracket}
      size="sm"
      className={className}
    />
  );
}

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

export function ButtonPriceDisplay({
  solAmount,
  className,
}: {
  solAmount: number;
  className?: string;
}) {
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUsdPrice = async () => {
      try {
        setLoading(true);
        const usd = await solToUsd(solAmount);
        if (mounted) {
          setUsdAmount(usd);
        }
      } catch (error) {
        console.warn('Price fetch failed, using fallback:', error);
        if (mounted) {
          const fallbackUsd = solAmount * 100;
          setUsdAmount(fallbackUsd);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (solAmount > 0) {
      fetchUsdPrice();
    } else {
      setLoading(false);
      setUsdAmount(0);
    }

    return () => {
      mounted = false;
    };
  }, [solAmount]);

  const formatNumber = (amount: number, decimals: number) => {
    return parseFloat(amount.toFixed(decimals)).toString();
  };

  if (loading) {
    return (
      <span className={cn('text-xs', className)}>
        <Loader2 className="h-3 w-3 animate-spin inline" />
      </span>
    );
  }

  if (usdAmount === null) {
    const formattedSol = formatNumber(solAmount, 3);
    return (
      <span className={cn('text-xs font-medium', className)}>
        [{formattedSol}]
      </span>
    );
  }

  const formattedUsd = formatNumber(usdAmount, 2);
  return (
    <span className={cn('text-xs font-medium', className)}>
      [${formattedUsd}]
    </span>
  );
}

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
        console.warn('Price conversion failed, using fallback:', err);
        if (mounted) {
          const fallbackUsd = solAmount * 100;
          setUsdAmount(fallbackUsd);
          setError(null);
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
