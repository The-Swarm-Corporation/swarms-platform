export const PLATFORM_COMMISSION_RATE = 0.1;

export function calculateCommission(amount: number) {
  const platformFee = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(6));
  const sellerAmount = Number((amount - platformFee).toFixed(6));

  return {
    platformFee,
    sellerAmount,
    totalAmount: amount,
    commissionRate: PLATFORM_COMMISSION_RATE,
  };
}

export function formatSOLAmount(
  amount: number,
  forceDecimals?: number,
): string {
  if (amount === 0) return '0 SOL';

  let decimals: number;

  if (forceDecimals !== undefined) {
    decimals = forceDecimals;
  } else {
    if (amount < 0.0001) {
      decimals = 8;
    } else if (amount < 0.01) {
      decimals = 6;
    } else {
      decimals = 4;
    }
  }

  return `${amount.toFixed(decimals)} SOL`;
}

export function validateCommissionCalculation(
  amount: number,
  platformFee: number,
  sellerAmount: number,
): boolean {
  const expectedFee = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(6));
  const expectedSellerAmount = Number((amount - expectedFee).toFixed(6));

  const feeMatch = Math.abs(platformFee - expectedFee) < 0.000001;
  const sellerMatch = Math.abs(sellerAmount - expectedSellerAmount) < 0.000001;
  const totalMatch = Math.abs(platformFee + sellerAmount - amount) < 0.000001;

  return feeMatch && sellerMatch && totalMatch;
}

export function getCommissionBreakdown(amount: number) {
  const { platformFee, sellerAmount } = calculateCommission(amount);

  return {
    total: formatSOLAmount(amount),
    platformFee: formatSOLAmount(platformFee),
    sellerAmount: formatSOLAmount(sellerAmount),
    commissionPercentage: `${(PLATFORM_COMMISSION_RATE * 100).toFixed(1)}%`,
    raw: {
      total: amount,
      platformFee,
      sellerAmount,
    },
  };
}
