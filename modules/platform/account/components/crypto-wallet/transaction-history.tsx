import { useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { formatDistance } from 'date-fns';
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, History, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-white';
      case 'pending':
        return 'text-white/60';
      default:
        return 'text-white/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '✓';
      case 'pending':
        return '⏳';
      default:
        return '✗';
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center p-8"
      >
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-light">Loading transaction history...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="mt-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/10 border border-white/20 rounded-xl">
          <History className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Transaction History</h3>
        {transactions && transactions.length > 0 && (
          <div className="ml-auto flex items-center gap-2 text-sm text-white/40 font-light">
            <TrendingUp className="h-4 w-4" />
            <span>{transactions.length} transactions</span>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/60 font-medium uppercase tracking-wider text-xs">Date</TableHead>
                <TableHead className="text-white/60 font-medium uppercase tracking-wider text-xs">Amount (USD)</TableHead>
                <TableHead className="text-white/60 font-medium uppercase tracking-wider text-xs">Credits</TableHead>
                <TableHead className="text-white/60 font-medium uppercase tracking-wider text-xs">Status</TableHead>
                <TableHead className="text-white/60 font-medium uppercase tracking-wider text-xs">Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {currentTransactions?.map((tx: any, index: number) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-white/10 hover:bg-white/5 transition-colors duration-200"
                  >
                    <TableCell className="text-white/80 font-light">
                      {formatDistance(new Date(tx.created_at), new Date(), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ${tx.amount_usd}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      {tx.credits_added}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                        </span>
                        <span className={`capitalize text-sm ${getStatusColor(tx.status)} font-light`}>
                          {tx.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.transaction_hash ? (
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={getExplorerUrl(tx.transaction_hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors duration-200"
                        >
                          <span className="text-sm font-light">View</span>
                          <ExternalLink className="h-3 w-3" />
                        </motion.a>
                      ) : (
                        <span className="text-white/40 text-sm font-light">-</span>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
                {(!transactions?.length || !currentTransactions?.length) && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-white/10"
                  >
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-white/40">
                        <History className="h-8 w-8" />
                        <span className="font-light">No transactions found</span>
                        <span className="text-sm font-light">Your transaction history will appear here</span>
                      </div>
                    </TableCell>
                  </motion.tr>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-between py-4"
        >
          <div className="text-sm text-white/40 font-light">
            Showing {startIndex + 1}-{Math.min(endIndex, transactions?.length || 0)} of {transactions?.length || 0} transactions
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 
                       disabled:text-white/20 text-white rounded-xl transition-all duration-200 font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </motion.button>
            <div className="text-sm text-white/40 px-3 py-2 font-light">
              Page {currentPage} of {totalPages}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 
                       disabled:text-white/20 text-white rounded-xl transition-all duration-200 font-medium"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TransactionHistory; 