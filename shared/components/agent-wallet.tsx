"use client"

import { useState, useEffect, AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, CircuitBoard, Wallet, Search, ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownLeft, Plus, Copy, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./spread_sheet_swarm/ui/dialog"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import Input from "./ui/Input"
import { Button } from "./ui/button"
import { trpc } from '@/shared/utils/trpc/trpc'
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./spread_sheet_swarm/ui/card"

// Add these component definitions after the imports and before the other components
const RadioGroup = RadioGroupPrimitive.Root
const RadioGroupItem = RadioGroupPrimitive.Item

interface AddressDisplayProps {
  address: string
  className?: string
}

export function AddressDisplay({ address, className = "" }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortenedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className={`relative group ${className}`}>
      <motion.div
        initial={false}
        animate={copied ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-sm"
      >
        Copied!
      </motion.div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/30 
                 hover:bg-red-500/20 transition-colors group-hover:border-red-500/50"
      >
        <span className="font-mono text-sm text-red-500">{shortenedAddress}</span>
        <Copy className="h-3 w-3 text-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  )
}

export function CreateWalletModal() {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const deployAgent = trpc.wallet.deployAgent.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setName("");
    },
  });

  const handleDeploy = async () => {
    if (name.length < 3) {
      return;
    }
    await deployAgent.mutate({ name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/20 hover:text-red-400">
          <Plus className="mr-2 h-4 w-4" />
          Deploy New Agent
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="bg-black/90 border-red-500/50 text-white backdrop-blur-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-50 flex items-center gap-2">
            <Plus className="h-6 w-6 text-red-500" />
            Deploy New Agent
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-red-50">
              Agent Name
            </Label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
              className="bg-black/50 border border-red-500/30 text-red-50 placeholder:text-red-500/50 focus:border-red-500 rounded-md p-2"
            />
          </div>
          <Button 
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={handleDeploy}
            disabled={name.length < 3 || deployAgent.isPending}
          >
            {deployAgent.isPending ? "Deploying..." : "Deploy Agent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SwarmsTicker({
    className = "",
    showBackground = true,
  }: { className?: string; showBackground?: boolean }) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <span className="relative inline-block group">
          {showBackground && (
            <>
              <span className="absolute inset-0 rounded-lg blur-sm bg-red-500/30 group-hover:bg-red-500/50 transition-colors duration-300" />
              <span className="absolute inset-0 rounded-lg animate-[pulse_2s_ease-in-out_infinite] bg-red-500/20" />
              <span className="absolute inset-[2px] rounded-lg bg-black/50 backdrop-blur-sm" />
            </>
          )}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            className="relative w-5 h-5 md:w-6 md:h-6 text-red-500 transform group-hover:scale-110 transition-transform duration-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L21.196 7V17L12 22L2.804 17V7L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:stroke-red-400 transition-colors duration-300"
            />
            <path
              d="M12 6L12 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="origin-center group-hover:rotate-[30deg] transition-transform duration-500"
            />
            <path
              d="M7 9L17 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="origin-center group-hover:-rotate-[30deg] transition-transform duration-500"
            />
            <path
              d="M17 9L7 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="origin-center group-hover:rotate-[30deg] transition-transform duration-500"
            />
          </svg>
        </span>
      </span>
    )
  }

interface Agent {
  id: string;
  name: string;
  api_key: string;
  status: string;
}

interface Wallet {
  id: string;
  agent_id: string;
  public_key: string;
}

interface Transaction {
  id: string;
  transaction_hash: string;
  amount: number;
  recipient: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  created_at: string;
  agent_id: string;
  transaction_type: 'send' | 'received';
}

interface TransactionListProps {
  transactions: Transaction[]
  pageSize?: number
}

export function TransactionList({ transactions, pageSize = 5 }: { transactions: Transaction[], pageSize?: number }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(transactions.length / pageSize);
  const currentTransactions = transactions.slice(page * pageSize, (page + 1) * pageSize);

  const formatAmount = (amount: number) => {
    return amount.toFixed(4); // Format to 4 decimal places
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-red-50 mb-3">Transaction History</h3>
      </div>
      <AnimatePresence mode="wait">
        {currentTransactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-lg border border-red-500/30 bg-black/40 backdrop-blur-lg flex items-center justify-between group relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                {tx.transaction_hash ? (
                  <a 
                    href={`https://solscan.io/tx/${tx.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-red-50 text-lg hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    {tx.transaction_hash.slice(0, 8)}...{tx.transaction_hash.slice(-8)}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="font-bold text-red-50 text-lg">Pending Transaction</div>
                )}
                <div className="text-sm text-red-500 font-mono">
                  {new Date(tx.created_at).toLocaleString()}
                </div>
                <div className="text-sm text-red-400">
                  {tx.transaction_type === 'send' ? 'Sent' : 'Received'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-red-50 text-lg flex items-center justify-end gap-2">
                <SwarmsTicker className="shrink-0" showBackground={false} />
                {tx.transaction_type === 'send' ? '-' : '+'}{formatAmount(tx.amount)}
              </span>
              <Badge
                variant="outline"
                className={`
                  ${tx.status === "COMPLETED" ? "border-green-500 text-green-500" : ""}
                  ${tx.status === "PENDING" ? "border-yellow-500 text-yellow-500" : ""}
                  ${tx.status === "FAILED" ? "border-red-500 text-red-500" : ""}
                `}
              >
                {tx.status}
              </Badge>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="border-red-500/30 text-red-500 hover:bg-red-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-red-500 font-mono">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="border-red-500/30 text-red-500 hover:bg-red-500/20"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

const glowVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
}

// Add this type definition at the top with other interfaces
interface Metrics {
  totalTransactions: number;
  totalAmount: number;
  sentTransactions: number;
  receivedTransactions: number;
  totalSent: number;
  totalReceived: number;
}

// Add the MetricsSummary component before the return statement
const MetricsSummary = ({ transactions, agentId, wallets }: { 
    transactions: Transaction[], 
    agentId: string,
    wallets: Wallet[] | null | undefined 
  }) => {
    const agentWallet = wallets?.find(w => w.agent_id === agentId);
    const metrics = {
      totalTransactions: transactions.length,
      sentTransactions: transactions.filter(tx => tx.transaction_type === 'send').length,
      receivedTransactions: transactions.filter(tx => tx.transaction_type === 'received').length,
      totalSent: transactions
        .filter(tx => tx.transaction_type === 'send')

        .reduce((sum, tx) => sum + Number(tx.amount), 0),
      totalReceived: transactions
        .filter(tx => tx.transaction_type === 'received')

        .reduce((sum, tx) => sum + Number(tx.amount), 0),
    };
  
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-red-500/30 bg-black/40">
          <div className="text-sm text-red-500">Total Transactions</div>
          <div className="text-2xl font-bold text-red-50">{metrics.totalTransactions}</div>
        </div>
        <div className="p-4 rounded-lg border border-red-500/30 bg-black/40">
          <div className="text-sm text-red-500">Total Sent</div>
          <div className="text-2xl font-bold text-red-50">{metrics.totalSent}</div>
        </div>
        <div className="p-4 rounded-lg border border-red-500/30 bg-black/40">
          <div className="text-sm text-red-500">Total Received</div>
          <div className="text-2xl font-bold text-red-50">{metrics.totalReceived}</div>
        </div>
      </div>
    );
  };

export default function AgentWallet() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  const { 
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError
  } = trpc.wallet.getActiveAgents.useQuery();
  
  const {
    data: wallets,
    isLoading: isLoadingWallets,
    error: walletsError
  } = trpc.wallet.getAgentWallets.useQuery();
  
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = trpc.wallet.getAgentTransactions.useQuery();

  // Process the data with proper typing
  const processedWallets = agents?.map((agent) => {
    const wallet = wallets?.find(w => w.agent_id === agent.id);
    return {
      id: agent.id,
      name: agent.name || 'Unnamed Agent',
      address: wallet?.public_key || '',
    };
  }) || [];
  

  // Define the type for processed wallets to use elsewhere
  type ProcessedWallet = {
    id: string;
    name: string;
    address: string;
  };

  // Update the filtering logic to be more flexible
  const filteredWallets = processedWallets.filter((wallet: ProcessedWallet) => {
    if (!searchQuery.trim()) return true;
    
    const searchTerms = searchQuery.toLowerCase().split(' ');
    const searchableFields = [
      wallet.name.toLowerCase(),
      wallet.id.toLowerCase(),
      wallet.address.toLowerCase()
    ];

    return searchTerms.every(term =>
      searchableFields.some(field => field.includes(term))
    );
  });

  // Filter and process transactions for selected wallet
  const selectedWalletTransactions = transactions?.map(tx => {
    const agentWallet = wallets?.find(w => w.agent_id === selectedWallet);
    if (!agentWallet) return null;
    
    const isReceived = tx.recipient === agentWallet.public_key;
    const isSent = tx.agent_id === selectedWallet;
    
    if (!isReceived && !isSent) return null;
    
    return {
      ...tx,
      transaction_type: isReceived ? 'received' : 'send'
    };
  }).filter(Boolean) as Transaction[] || [];

  // Add a "no results" state
  const NoResults = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full p-8 text-center border border-red-500/30 rounded-lg bg-black/40 backdrop-blur-sm"
    >
      <div className="text-red-500 mb-2">No agents found matching "{searchQuery}"</div>
      <div className="text-red-400/60 text-sm">
        Try adjusting your search terms or clear the search to see all agents
      </div>
    </motion.div>
  );

  useEffect(() => {
    if (filteredWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(filteredWallets[0].id)
    }
    setIsLoaded(true)
  }, [filteredWallets, selectedWallet])

  if (isLoadingAgents || isLoadingWallets || isLoadingTransactions) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-red-500">Loading...</div>
      </div>
    );
  }

  if (agentsError || walletsError || transactionsError) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-red-500">Error loading data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
        <motion.div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDAsIDAsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="relative mb-8 z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent" />
        <motion.div
          className="absolute -left-4 -top-4 w-20 h-20 border border-red-500/50 rounded-full"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        <h1 className="text-5xl font-bold tracking-tighter relative z-10 flex items-center gap-3 text-red-50">
          <CircuitBoard className="h-12 w-12 text-red-500" />
          Swarms Wallet <span className="text-sm text-red-500 mt-1 font-mono">v2.077</span>
        </h1>
        <p className="text-red-500 text-lg mt-2 font-mono">SECURE AGENT INTERFACE</p>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6 relative z-10">
        {/* Wallets Grid */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-black/50 border-red-900/50 backdrop-blur-sm relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-red-900/5 to-transparent"
              variants={glowVariants}
              initial="initial"
              animate="animate"
            />
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-red-50">
                  <Wallet className="h-8 w-8 text-red-500" />
                  ACTIVE AGENTS
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    <input
                      type="text"
                      placeholder="Search by name, ID, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 bg-black/50 border border-red-500/30 text-red-50 placeholder:text-red-500/50 focus:border-red-500 transition-colors rounded-md p-2"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500/50 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <CreateWalletModal />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredWallets.length > 0 ? (
                  filteredWallets.map((wallet: { id: string; name: string; address: string}, i: number) => (
                    <motion.div
                      key={wallet.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedWallet(wallet.id)}
                      className={`p-6 rounded-lg border cursor-pointer
                        ${selectedWallet === wallet.id ? "border-red-500 bg-red-500/10" : "border-red-500/30 bg-black/40"} 
                        backdrop-blur-lg relative group overflow-hidden`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-red-50">{wallet.name}</h3>
                          <div className="space-y-1">
                            <p className="text-sm text-red-500 font-mono">ID: {wallet.id}</p>
                            <AddressDisplay address={wallet.address} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <NoResults />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions for Selected Wallet */}
        {selectedWallet && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-black/50 border-red-900/50 backdrop-blur-sm relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-red-900/5 to-transparent"
                variants={glowVariants}
                initial="initial"
                animate="animate"
              />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold flex items-center gap-3 text-red-50">
                    <BarChart3 className="h-8 w-8 text-red-500" />
                    {filteredWallets.find((w: { id: string | null }) => w.id === selectedWallet)?.name} OPERATIONS
                  </h2>
                  <Badge variant="outline" className="border-red-500 text-red-500 px-4 py-1">
                    {selectedWalletTransactions.length} TOTAL
                  </Badge>
                </div>

                <MetricsSummary 
                  transactions={selectedWalletTransactions} 
                  agentId={selectedWallet!}
                  wallets={wallets}
                />
                <TransactionList transactions={selectedWalletTransactions} pageSize={5} />

              </CardContent>
            </Card>

          </motion.div>
        )}
      </div>
    </div>
  )
}

