import { UserUsage } from '@/shared/utils/api/usage';
import React from 'react';
import MonthlySpend from './charts/costs/monthly-spend';

export default function MonthlyChart({ data }: { data: UserUsage | null }) {
  const totalCost = data?.totalCost ? data.totalCost.toFixed(3) : 0;
  const invoiceTotalCost = data?.invoiceTotalCost
    ? data.invoiceTotalCost.toFixed(3)
    : 0;
  return (
    <div>
      <div className="flex flex-col sm:items-center sm:flex-row gap-2">
        <h2 className="max-md:text-sm">Monthly Usage:</h2>
        <div className="flex items-center justify-center p-0 max-sm:px-2 bg-secondary rounded-md w-fit">
          <p className="px-3 py-0 h-8 w-28 lg:w-32 flex items-center text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-primary">
            ${totalCost}{' '}
            <span className="ml-2 bg-black p-1 px-2 text-xs text-white rounded-sm shadow-sm">
              Default
            </span>
          </p>
          <hr />
          <p
            className="px-3 py-0 h-8 w-28 lg:w-32 flex items-center text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-primary"
            title="Amount to charge at the end of the month"
          >
            ${invoiceTotalCost}{' '}
            <span className="ml-2 bg-black p-1 px-2 text-xs text-white rounded-sm shadow-sm">
              Invoice
            </span>
          </p>
        </div>
      </div>

      <MonthlySpend usageData={data} />
    </div>
  );
}
