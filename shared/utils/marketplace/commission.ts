/**
 * Marketplace commission calculation utilities
 * Ensures consistent and precise commission calculations across the platform
 */

export const PLATFORM_COMMISSION_RATE = 0.1; // 10%

/**
 * Calculate platform commission with proper decimal precision
 * @param amount - The total transaction amount in SOL
 * @returns Object containing platformFee and sellerAmount with 6 decimal precision
 */
export function calculateCommission(amount: number) {
  // Ensure we maintain 6 decimal places precision for SOL amounts
  const platformFee = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(6));
  const sellerAmount = Number((amount - platformFee).toFixed(6));

  return {
    platformFee,
    sellerAmount,
    totalAmount: amount,
    commissionRate: PLATFORM_COMMISSION_RATE,
  };
}

/**
 * Format SOL amount with dynamic precision based on value size
 * @param amount - SOL amount to format
 * @param forceDecimals - Force specific number of decimals (optional)
 * @returns Formatted string with appropriate decimal places
 */
export function formatSOLAmount(amount: number, forceDecimals?: number): string {
  if (amount === 0) return '0 SOL';

  let decimals: number;
  
  if (forceDecimals !== undefined) {
    decimals = forceDecimals;
  } else {
    // Dynamic precision based on amount size
    if (amount < 0.0001) {
      decimals = 8; // Very small amounts need more precision
    } else if (amount < 0.01) {
      decimals = 6; // Small amounts need good precision
    } else {
      decimals = 4; // Standard precision for larger amounts
    }
  }

  return `${amount.toFixed(decimals)} SOL`;
}

/**
 * Validate that commission calculation is correct
 * @param amount - Original amount
 * @param platformFee - Calculated platform fee
 * @param sellerAmount - Calculated seller amount
 * @returns boolean indicating if calculation is valid
 */
export function validateCommissionCalculation(
  amount: number,
  platformFee: number,
  sellerAmount: number
): boolean {
  const expectedFee = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(6));
  const expectedSellerAmount = Number((amount - expectedFee).toFixed(6));
  
  // Allow for tiny floating point differences
  const feeMatch = Math.abs(platformFee - expectedFee) < 0.000001;
  const sellerMatch = Math.abs(sellerAmount - expectedSellerAmount) < 0.000001;
  const totalMatch = Math.abs((platformFee + sellerAmount) - amount) < 0.000001;

  return feeMatch && sellerMatch && totalMatch;
}

/**
 * Get commission breakdown for display purposes
 * @param amount - Total transaction amount
 * @returns Formatted commission breakdown
 */
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
    }
  };
}
