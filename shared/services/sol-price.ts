interface SolPriceResponse {
  solana: {
    usd: number;
  };
}

interface CachedPrice {
  price: number;
  timestamp: number;
}

const CACHE_DURATION = 30 * 1000; // 30 seconds
let cachedPrice: CachedPrice | null = null;

export async function getSolPrice(): Promise<number> {
  try {
    if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
      return cachedPrice.price;
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SolPriceResponse = await response.json();
    const price = data.solana?.usd;

    if (!price || typeof price !== 'number') {
      throw new Error('Invalid price data received');
    }

    cachedPrice = {
      price,
      timestamp: Date.now(),
    };

    return price;
  } catch (error) {
    console.error('Failed to fetch SOL price:', error);
    
    if (cachedPrice) {
      console.warn('Using cached SOL price due to fetch error');
      return cachedPrice.price;
    }
    
    console.warn('Using fallback SOL price');
    return 100;
  }
}

export async function solToUsd(solAmount: number): Promise<number> {
  const solPrice = await getSolPrice();
  return solAmount * solPrice;
}

export async function formatSolWithUsd(
  solAmount: number,
  options: {
    showSol?: boolean;
    showUsd?: boolean;
    solDecimals?: number;
    usdDecimals?: number;
  } = {}
): Promise<string> {
  const {
    showSol = true,
    showUsd = true,
    solDecimals = 4,
    usdDecimals = 2,
  } = options;

  const usdAmount = await solToUsd(solAmount);

  if (showSol && showUsd) {
    return `${solAmount.toFixed(solDecimals)} SOL (~$${usdAmount.toFixed(usdDecimals)})`;
  } else if (showSol) {
    return `${solAmount.toFixed(solDecimals)} SOL`;
  } else if (showUsd) {
    return `$${usdAmount.toFixed(usdDecimals)}`;
  }

  return '';
}

export async function getSolPriceChange(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.solana?.usd_24h_change || 0;
  } catch (error) {
    console.error('Failed to fetch SOL price change:', error);
    return 0;
  }
}

export function formatPriceChange(change: number): {
  formatted: string;
  color: 'green' | 'red' | 'gray';
} {
  const formatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  const color = change > 0 ? 'green' : change < 0 ? 'red' : 'gray';
  
  return { formatted, color };
}

export async function batchSolToUsd(solAmounts: number[]): Promise<number[]> {
  const solPrice = await getSolPrice();
  return solAmounts.map(amount => amount * solPrice);
}

export async function getFormattedPrice(
  solAmount: number,
  options: {
    showBoth?: boolean;
    compact?: boolean;
  } = {}
): Promise<string> {
  const { showBoth = true, compact = false } = options;
  
  if (!showBoth) {
    return `${solAmount.toFixed(4)} SOL`;
  }

  const usdAmount = await solToUsd(solAmount);
  
  if (compact) {
    return `${solAmount.toFixed(2)} SOL ($${usdAmount.toFixed(0)})`;
  }
  
  return `${solAmount.toFixed(4)} SOL (~$${usdAmount.toFixed(2)})`;
}
