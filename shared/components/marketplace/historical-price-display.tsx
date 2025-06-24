import { USDPriceDisplay } from '@/shared/components/marketplace/price-display';

export const HistoricalPriceDisplay = ({
  solAmount,
  historicalUsd,
  className,
  showBracket = false
}: {
  solAmount: number;
  historicalUsd?: number;
  className?: string;
  showBracket?: boolean;
}) => {
  if (historicalUsd !== undefined) {
    const formattedUsd = parseFloat(historicalUsd.toFixed(2)).toString();

    if (showBracket) {
      return <span className={className}>[${formattedUsd}]</span>;
    }

    return (
      <span className={className}>
        ${formattedUsd}
      </span>
    );
  }

  // Fallback to live price component
  return (
    <USDPriceDisplay
      solAmount={solAmount}
      className={className}
      showBracket={showBracket}
    />
  );
};