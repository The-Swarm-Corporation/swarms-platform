'use client';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { PublicKey, Transaction, Connection, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { trpc } from '@/shared/utils/trpc/trpc';
import useSubscription from '@/shared/hooks/subscription';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Coins, Zap, CheckCircle, Loader2 } from 'lucide-react';

const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string);
const DAO_TREASURY_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS as string);

type TokenType = 'SOL' | 'SWARMS';

const CryptoWallet = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const { refetchCredit } = useSubscription();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [swarmsPrice, setSwarmsPrice] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<TokenType>('SWARMS');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [rpcUrl, setRpcUrl] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const addUsdBalanceMutation = trpc.dashboard.addCryptoTransactionCredit.useMutation({
    onSuccess: async (data) => {
      await refetchCredit();
      setLastTransaction(data);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 4000);
      toast({
        description: `Successfully added ${data.creditsAdded} credits!`,
        style: { backgroundColor: '#10B981', color: 'white' },
      });
      setUsdAmount('');
    },
    onError: (error) => {
      toast({
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        if (config?.rpcUrl) {
          setRpcUrl(config.rpcUrl);
          checkWalletConnection(config.rpcUrl);
          fetchPrices();
        }
      } catch (error) {
        console.error('Failed to fetch Solana config:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchConfig();
  }, []);

  const checkWalletConnection = async (RPC_URL: string) => {
    try {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        setPublicKey(response.publicKey.toString());
      }
    } catch (error) {
      // silent
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window as any;
      if (!solana) {
        toast({ description: 'Please install Phantom wallet', variant: 'destructive' });
        return;
      }
      const response = await solana.connect();
      setPublicKey(response.publicKey.toString());
    } catch (error) {
      toast({ description: 'Failed to connect wallet', variant: 'destructive' });
    }
  };

  const fetchPrices = async () => {
    try {
      const swarmsResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=swarms&vs_currencies=usd');
      const swarmsData = await swarmsResponse.json();
      setSwarmsPrice(swarmsData.swarms?.usd || 0);
      const solResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const solData = await solResponse.json();
      setSolPrice(solData.solana?.usd || 0);
    } catch (error) {
      // silent
    }
  };

  const getCoinAmount = () => {
    const usd = parseFloat(usdAmount || '0');
    if (!usd) return 0;
    if (selectedToken === 'SWARMS') return usd / (swarmsPrice || 1);
    return usd / (solPrice || 1);
  };

  const sendTokens = async () => {
    if (!publicKey || !usdAmount || !rpcUrl || isLoading) return;
    setIsLoading(true);
    try {
      const { solana } = window as any;
      const connection = new Connection(rpcUrl, { commitment: 'confirmed', wsEndpoint: rpcUrl.replace('https://', 'wss://') });
      const senderPublicKey = new PublicKey(publicKey);
      let signature: string;
      if (selectedToken === 'SWARMS') {
        const sourceAccount = await getAssociatedTokenAddress(SWARMS_TOKEN_ADDRESS, senderPublicKey, false);
        const destinationAccount = await getAssociatedTokenAddress(SWARMS_TOKEN_ADDRESS, DAO_TREASURY_ADDRESS, false);
        const DECIMALS = 6;
        const rawAmount = Math.floor(getCoinAmount() * Math.pow(10, DECIMALS));
        const transaction = new Transaction().add(
          createTransferCheckedInstruction(
            sourceAccount,
            SWARMS_TOKEN_ADDRESS,
            destinationAccount,
            senderPublicKey,
            rawAmount,
            DECIMALS,
            [],
          ),
        );
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPublicKey;
        const signedTx = await solana.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
        await addUsdBalanceMutation.mutateAsync({
          amountUsd: parseFloat(usdAmount),
          transactionHash: signature,
          swarmsAmount: getCoinAmount(),
        });
      } else {
        // SOL
        const lamports = Math.floor(getCoinAmount() * LAMPORTS_PER_SOL);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: senderPublicKey,
            toPubkey: DAO_TREASURY_ADDRESS,
            lamports,
          })
        );
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPublicKey;
        const signedTx = await solana.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
        await addUsdBalanceMutation.mutateAsync({
          amountUsd: parseFloat(usdAmount),
          transactionHash: signature,
          swarmsAmount: 0,
        });
      }
      setUsdAmount('');
    } catch (error: any) {
      toast({ description: error.message || 'Transaction failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const { solana } = window as any;
      if (solana) {
        await solana.disconnect();
        setPublicKey(null);
        toast({
          description: 'Wallet disconnected successfully',
          style: { backgroundColor: '#10B981', color: 'white' },
        });
      }
    } catch (error) {
      toast({ description: 'Failed to disconnect wallet', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 p-6 rounded-2xl border border-white/10 bg-black/80">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-6 w-6 text-white" />
          <span className="text-xl font-bold text-white tracking-tight">Purchase Credits</span>
        </div>
        {!publicKey ? (
          <button
            onClick={connectWallet}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl mt-2 hover:bg-white/90 transition"
          >
            Connect Phantom Wallet
          </button>
        ) : (
          <>
            <div className="w-full">
              <label className="block text-white/70 text-sm mb-1">Amount in USD</label>
              <input
                type="number"
                min="0"
                step="any"
                value={usdAmount}
                onChange={e => setUsdAmount(e.target.value)}
                placeholder="Enter USD amount"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white font-mono focus:outline-none focus:border-white"
                disabled={isLoading}
              />
            </div>
            <div className="w-full flex items-center gap-2 mt-2">
              <label className="text-white/70 text-sm">Pay with</label>
              <select
                value={selectedToken}
                onChange={e => setSelectedToken(e.target.value as TokenType)}
                className="bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none"
                disabled={isLoading}
              >
                <option value="SWARMS">SWARMS</option>
                <option value="SOL">SOL</option>
              </select>
            </div>
            <div className="w-full mt-2">
              <label className="block text-white/70 text-sm mb-1">You will send</label>
              <input
                type="text"
                value={getCoinAmount() ? getCoinAmount().toFixed(6) + ' ' + selectedToken : ''}
                readOnly
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none"
              />
            </div>
            <button
              onClick={sendTokens}
              disabled={!usdAmount || isLoading || !parseFloat(usdAmount)}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl mt-4 hover:bg-white/90 transition flex items-center justify-center gap-2 disabled:bg-white/20 disabled:text-white/40"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Coins className="h-5 w-5" />}
              {isLoading ? 'Processing...' : 'Purchase Credits'}
            </button>
            <button
              onClick={disconnectWallet}
              className="w-full bg-white/10 text-white font-semibold py-3 rounded-xl mt-3 hover:bg-white/20 transition border border-white/10"
              type="button"
            >
              Disconnect Wallet
            </button>
          </>
        )}
        <AnimatePresence>
          {showThankYou && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex flex-col items-center justify-center p-10 rounded-3xl bg-black/90 border border-white/20 shadow-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="mb-8"
                >
                  <CheckCircle className="h-24 w-24 text-green-400 drop-shadow-lg" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-extrabold text-white mb-4 text-center"
                >
                  Thank you!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-xl mb-6 text-center"
                >
                  Your credits have been added to your balance.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-green-400 text-lg font-semibold flex items-center gap-2"
                >
                  <CheckCircle className="h-6 w-6" />
                  Payment Confirmed
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CryptoWallet;
