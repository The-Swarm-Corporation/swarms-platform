'use client';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { trpc } from '@/shared/utils/trpc/trpc';
import useSubscription from '@/shared/hooks/subscription';
import TransactionHistory from './transaction-history';

const SWARMS_TOKEN_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string,
);
const DAO_TREASURY_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS as string,
);

const CryptoWallet = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const { refetchCredit } = useSubscription();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [swarmsBalance, setSwarmsBalance] = useState<number>(0);
  const [swarmsPrice, setSwarmsPrice] = useState<number>(0);
  const [amountToSend, setAmountToSend] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [rpcUrl, setRpcUrl] = useState<string | null>(null);

  const addUsdBalanceMutation =
    trpc.dashboard.addCryptoTransactionCredit.useMutation({
      onSuccess: async (data) => {
        await refetchCredit();

        if (publicKey) {
          await fetchSwarmsBalance(publicKey, rpcUrl!);
        }

        toast({
          description: `Successfully added ${data.creditsAdded} credits and processed ${amountToSend} SWARMS`,
          style: { backgroundColor: '#10B981', color: 'white' },
        });

        setAmountToSend('');
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
          fetchSwarmsPrice();
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
        fetchSwarmsBalance(response.publicKey.toString(), RPC_URL);
      }
    } catch (error) {
      console.error('Auto-connect error:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window as any;
      if (!solana) {
        toast({
          description: 'Please install Phantom wallet',
          variant: 'destructive',
        });
        return;
      }
      const response = await solana.connect();
      setPublicKey(response.publicKey.toString());
      fetchSwarmsBalance(response.publicKey.toString(), rpcUrl!);
    } catch (error) {
      console.error('Connect error:', error);
      toast({
        description: 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      const { solana } = window as any;
      if (solana) {
        await solana.disconnect();
        setPublicKey(null);
        setSwarmsBalance(0);
        toast({
          description: 'Wallet disconnected successfully',
          style: { backgroundColor: '#10B981', color: 'white' },
        });
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        description: 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  const fetchSwarmsBalance = async (address: string, RPC_URL: string) => {
    try {
      const connection = new Connection(RPC_URL, 'confirmed');
      const tokenAccount = await getAssociatedTokenAddress(
        SWARMS_TOKEN_ADDRESS,
        new PublicKey(address),
      );
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      setSwarmsBalance(balance.value.uiAmount || 0);
    } catch (error) {
      console.error('Balance fetch error:', error);
      setSwarmsBalance(0);
    }
  };

  const fetchSwarmsPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=swarms&vs_currencies=usd',
      );
      const data = await response.json();
      setSwarmsPrice(data.swarms.usd);
    } catch (error) {
      console.error('Price fetch error:', error);
    }
  };

  const sendTokens = async () => {
    if (!publicKey || !amountToSend || !rpcUrl || isLoading) return;

    setIsLoading(true);

    try {
      const { solana } = window as any;
      const connection = new Connection(rpcUrl, {
        commitment: 'confirmed',
        wsEndpoint: rpcUrl.replace('https://', 'wss://'),
      });

      const senderPublicKey = new PublicKey(publicKey);

      const sourceAccount = await getAssociatedTokenAddress(
        SWARMS_TOKEN_ADDRESS,
        senderPublicKey,
        false,
      );

      const destinationAccount = await getAssociatedTokenAddress(
        SWARMS_TOKEN_ADDRESS,
        DAO_TREASURY_ADDRESS,
        false,
      );

      const DECIMALS = 6;
      const rawAmount = Math.floor(
        parseFloat(amountToSend) * Math.pow(10, DECIMALS),
      );

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
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
      );

      const confirmation = await connection.confirmTransaction(
        signature,
        'confirmed',
      );

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
        );
      }

      const usdValue = parseFloat(amountToSend) * swarmsPrice;

      await addUsdBalanceMutation.mutateAsync({
        amountUsd: usdValue,
        transactionHash: signature,
        swarmsAmount: parseFloat(amountToSend),
      });

      toast({
        description: 'Payment successful!',
        style: { backgroundColor: '#10B981', color: 'white' },
      });

      fetchSwarmsBalance(publicKey, rpcUrl);
      setAmountToSend('');
    } catch (error: any) {
      console.error('Transaction error:', {
        error,
        message: error.message,
        logs: error.logs,
        data: error.data,
      });

      let errorMessage = 'Transaction failed. Please try again.';

      if (
        error.logs?.some((log: string) => log.includes('insufficient funds')) ||
        error.message?.includes('insufficient funds')
      ) {
        errorMessage = 'Insufficient $SWARMS balance';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('Destination account')) {
        errorMessage = 'Invalid destination account';
      }

      toast({
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setAmountToSend(value);
    }
  };

  return (
    <div className=" bg-black text-red-500">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-black/50 backdrop-blur-xl border-2 border-red-500/50 rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-red-500 mb-2 font-cyber">
              CREDIT SYSTEM
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-transparent"></div>
          </div>

          {/* Wallet Connection */}
          {isFetching ? (
            <div
              className="w-full flex items-center justify-center bg-red-500/20 border border-red-500 text-red-500 
                       font-bold py-4 px-6 rounded-lg mb-6"
            >
              Loading...
            </div>
          ) : !publicKey ? (
            <button
              onClick={connectWallet}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-500 
                       font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out
                       hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-6"
            >
              CONNECT PHANTOM
            </button>
          ) : (
            <div className="space-y-6">
              {/* Wallet Info */}
              <div className="flex justify-between items-center mb-6">
                <div className="grid grid-cols-2 gap-4 flex-grow">
                  <div className="bg-black/60 border border-red-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400">
                      CONNECTED WALLET
                    </div>
                    <div className="font-mono text-red-400">
                      {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                    </div>
                  </div>
                  <div className="bg-black/60 border border-red-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400">$SWARMS BALANCE</div>
                    <div className="font-mono text-red-400">
                      {swarmsBalance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="ml-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 
                           text-red-500 rounded-lg transition duration-300 ease-in-out
                           hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  DISCONNECT
                </button>
              </div>

              {/* Payment Section */}
              <div className="bg-black/60 border border-red-500/30 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">$SWARMS PRICE</span>
                  <span className="text-red-400">
                    ${swarmsPrice.toFixed(4)}
                  </span>
                </div>

                <div className="space-y-4">
                  <input
                    type="number"
                    value={amountToSend}
                    onChange={handleAmountChange}
                    min="0"
                    step="any"
                    placeholder="Amount of $SWARMS"
                    className="w-full bg-black/60 border border-red-500/30 rounded-lg px-4 py-3 
                             text-red-500 placeholder-red-500/50 focus:outline-none focus:border-red-500"
                    disabled={isLoading}
                  />

                  <div className="text-right text-sm text-gray-400">
                    ≈ $
                    {(parseFloat(amountToSend || '0') * swarmsPrice).toFixed(2)}{' '}
                    USD
                  </div>

                  <button
                    onClick={sendTokens}
                    disabled={!amountToSend || isLoading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-black
                              ${
                                isLoading
                                  ? 'bg-gray-500 cursor-not-allowed'
                                  : 'bg-red-500 hover:bg-red-600 transition-all duration-300'
                              }`}
                  >
                    {isLoading
                      ? 'PROCESSING...'
                      : 'Exchange $SWARMS for credits'}
                  </button>
                </div>
              </div>

              {/* Add Transaction History */}
              {user && <TransactionHistory userId={user.id} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoWallet;
