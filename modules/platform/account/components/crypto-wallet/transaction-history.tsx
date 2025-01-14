import { useEffect, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { formatDistance } from 'date-fns';
import { Loader2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';

const TransactionHistory = ({ userId }: { userId: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: transactions, isLoading } = trpc.dashboard.getCreditTransactions.useQuery(
    { userId },
    { refetchInterval: 30000 }
  );

  const totalPages = transactions ? Math.ceil(transactions.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactions?.slice(startIndex, endIndex);

  const getExplorerUrl = (hash: string) => {
    const baseUrl = 'https://explorer.solana.com';
    return `${baseUrl}/tx/${hash}`;
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {/* <TableHead>Type</TableHead> */}
              <TableHead>Amount (USD)</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions?.map((tx: any) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {formatDistance(new Date(tx.created_at), new Date(), { addSuffix: true })}
                </TableCell>
                {/* <TableCell>{tx.transaction_type}</TableCell> */}
                <TableCell>${tx.amount_usd}</TableCell>
                <TableCell>${tx.credits_added}</TableCell>
                <TableCell>
                  <span className={`capitalize ${
                    tx.status === 'completed' ? 'text-green-600' : 
                    tx.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {tx.status}
                  </span>
                </TableCell>
                <TableCell>
                  {tx.transaction_hash ? (
                    <a
                      href={getExplorerUrl(tx.transaction_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      View <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!transactions?.length || !currentTransactions?.length) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 