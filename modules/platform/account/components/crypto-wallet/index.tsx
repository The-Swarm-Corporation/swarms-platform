'use client';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { PublicKey, Transaction, Connection, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferCheckedInstruction } from '@solana/spl-token';
import { trpc } from '@/shared/utils/trpc/trpc';
import useSubscription from '@/shared/hooks/subscription';
import TransactionHistory from './transaction-history';

const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string);
const DAO_TREASURY_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS as string);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

const CryptoWallet = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const { refetchCredit } = useSubscription();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [swarmsBalance, setSwarmsBalance] = useState<number>(0);
  const [swarmsPrice, setSwarmsPrice] = useState<number>(0);
  const [amountToSend, setAmountToSend] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addUsdBalanceMutation = trpc.dashboard.addCryptoTransactionCredit.useMutation({
    onSuccess: async (data) => {
      // Silently refresh credit balance
      await refetchCredit();
      
      // Refresh SWARMS balance
      if (publicKey) {
        await fetchSwarmsBalance(publicKey);
      }
      
      // Show single success message with combined information
      toast({
        description: `Successfully added ${data.creditsAdded} credits and processed ${amountToSend} SWARMS`,
        style: { backgroundColor: '#10B981', color: 'white' }
      });
      
      setAmountToSend('');
    },
    onError: (error) => {
      toast({
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    checkWalletConnection();
    fetchSwarmsPrice();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        setPublicKey(response.publicKey.toString());
        fetchSwarmsBalance(response.publicKey.toString());
      }
    } catch (error) {
      console.error('Auto-connect error:', error);
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
      fetchSwarmsBalance(response.publicKey.toString());
    } catch (error) {
      console.error('Connect error:', error);
      toast({ description: 'Failed to connect wallet', variant: 'destructive' });
    }
  };

  const fetchSwarmsBalance = async (address: string) => {
    try {
      const connection = new Connection(RPC_URL, 'confirmed');
      const tokenAccount = await getAssociatedTokenAddress(
        SWARMS_TOKEN_ADDRESS,
        new PublicKey(address)
      );
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      console.log('Fetched balance:', {
        raw: balance.value.amount,
        formatted: balance.value.uiAmount
      });
      setSwarmsBalance(balance.value.uiAmount || 0);
    } catch (error) {
      console.error('Balance fetch error:', error);
      setSwarmsBalance(0);
    }
  };

  const fetchSwarmsPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=swarms&vs_currencies=usd');
      const data = await response.json();
      setSwarmsPrice(data.swarms.usd);
    } catch (error) {
      console.error('Price fetch error:', error);
    }
  };

  const sendTokens = async () => {
    if (!publicKey || !amountToSend || isLoading) return;
    
    setIsLoading(true);

    try {
      const { solana } = window as any;
      const connection = new Connection(RPC_URL, { 
        commitment: 'confirmed',
        wsEndpoint: RPC_URL.replace('https://', 'wss://')
      });
      
      const senderPublicKey = new PublicKey(publicKey);

      // Get the sender's token account
      const sourceAccount = await getAssociatedTokenAddress(
        SWARMS_TOKEN_ADDRESS,
        senderPublicKey,
        false,
      );

      // Get the destination token account
      const destinationAccount = await getAssociatedTokenAddress(
        SWARMS_TOKEN_ADDRESS,
        DAO_TREASURY_ADDRESS,
        false,
      );

      // Convert amount with proper decimals
      const DECIMALS = 6;
      const rawAmount = Math.floor(parseFloat(amountToSend) * Math.pow(10, DECIMALS));

      // Create transaction
      const transaction = new Transaction().add(
        createTransferCheckedInstruction(
          sourceAccount,
          SWARMS_TOKEN_ADDRESS,
          destinationAccount,
          senderPublicKey,
          rawAmount,
          DECIMALS,
          [],  // No additional signers
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      // Sign and send
      const signedTx = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation with more detailed status
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      // Calculate USD value
      const usdValue = parseFloat(amountToSend) * swarmsPrice;

      // Log the transaction with blockchain verification
      await addUsdBalanceMutation.mutateAsync({
        amountUsd: usdValue,
        transactionHash: signature,
        swarmsAmount: parseFloat(amountToSend),
      });

      toast({
        description: 'Payment successful!',
        style: { backgroundColor: '#10B981', color: 'white' }
      });

      // Refresh balance
      fetchSwarmsBalance(publicKey);
      setAmountToSend('');
    } catch (error: any) {
      console.error('Transaction error:', {
        error,
        message: error.message,
        logs: error.logs,
        data: error.data
      });
      
      let errorMessage = 'Transaction failed. Please try again.';
      
      if (error.logs?.some((log: string) => log.includes('insufficient funds')) || 
          error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient $SWARMS balance';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('Destination account')) {
        errorMessage = 'Invalid destination account';
      }

      toast({
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only update if the value is empty or a positive number
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
          {!publicKey ? (
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/60 border border-red-500/30 rounded-lg p-4">
                  <div className="text-sm text-gray-400">CONNECTED WALLET</div>
                  <div className="font-mono text-red-400">
                    {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                  </div>
                </div>
                <div className="bg-black/60 border border-red-500/30 rounded-lg p-4">
                  <div className="text-sm text-gray-400">$SWARMS BALANCE</div>
                  <div className="font-mono text-red-400">{swarmsBalance.toFixed(2)}</div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-black/60 border border-red-500/30 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">$SWARMS PRICE</span>
                  <span className="text-red-400">${swarmsPrice.toFixed(4)}</span>
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
                    ≈ ${(parseFloat(amountToSend || '0') * swarmsPrice).toFixed(2)} USD
                  </div>

                  <button
                    onClick={sendTokens}
                    disabled={!amountToSend || isLoading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-black
                              ${isLoading 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-red-500 hover:bg-red-600 transition-all duration-300'
                              }`}
                  >
                    {isLoading ? 'PROCESSING...' : 'Exchange $SWARMS for credits'}
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
