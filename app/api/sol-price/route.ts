import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      process.env.COIN_GECKO_API ||
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const solPrice = data.solana?.usd || 100; // Fallback to $100

    return NextResponse.json({ 
      price: solPrice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch SOL price:', error);
    
    // Return fallback price
    return NextResponse.json({ 
      price: 100,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch live price, using fallback'
    });
  }
}
