'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { Button } from '@/shared/components/ui/button';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createEnhancedConnection, executeTransactionWithRetry } from '@/shared/utils/solana-transaction-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { useWallet } from '@/shared/components/marketplace/wallet-provider';
import { trpc } from '@/shared/utils/trpc/trpc';
import useSubscription from '@/shared/hooks/subscription';
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  Zap, 
  DollarSign, 
  Coins,
  Calendar,
  Star,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';

// Import existing components
import Credit from '../credit';
import SubscriptionStatus from '../subscription-status';
import CardManager from '../card-manager';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  last4?: string;
  brand?: string;
  walletAddress?: string;
  isDefault: boolean;
}

const UnifiedBilling = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const { publicKey, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { 
    credit, 
    refetchCredit, 
    data: subscriptionData, 
    status: subscriptionStatus,
    isSubscribed 
  } = useSubscription();
  
  // Fetch real payment methods from API
  const { data: realPaymentMethods, refetch: refetchPaymentMethods } = trpc.payment.getUserPaymentMethods.useQuery();
  
  // SOL price and wallet balance state
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingSolPrice, setLoadingSolPrice] = useState(false);
  const [lastSolPriceFetch, setLastSolPriceFetch] = useState<number>(0);
  
  // Modal states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  
  // Purchase modal states
  const [purchaseMethod, setPurchaseMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Transaction details for confirmation
  const [transactionDetails, setTransactionDetails] = useState<{
    amount: string;
    method: string;
    type: 'fiat' | 'crypto';
    estimatedCredits: number;
  } | null>(null);
  
  // Initialize payment methods - fetch from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Update payment methods with real data from API
  useEffect(() => {
    if (realPaymentMethods) {
      // Convert API data to our PaymentMethod format
      const apiCards: PaymentMethod[] = realPaymentMethods.map((method: any) => ({
        id: method.id,
        type: 'card',
        last4: method.card?.last4,
        brand: method.card?.brand,
        isDefault: method.isDefault || false,
      }));

      // Add wallet if connected
      const methods = [...apiCards];
      if (isConnected && publicKey) {
        methods.push({
          id: 'wallet',
          type: 'wallet',
          walletAddress: publicKey,
          isDefault: false,
        });
      }

      setPaymentMethods(methods);
    }
  }, [realPaymentMethods, isConnected, publicKey]);

  // Set default payment method when modal opens
  useEffect(() => {
    if (purchaseModalOpen && !selectedPaymentMethod) {
      if (purchaseMethod === 'fiat') {
        const defaultCard = paymentMethods.find(pm => pm.type === 'card' && pm.isDefault);
        if (defaultCard) {
          setSelectedPaymentMethod(defaultCard.id);
        }
      } else if (purchaseMethod === 'crypto' && isConnected) {
        setSelectedPaymentMethod('wallet');
      }
    }
  }, [purchaseModalOpen, purchaseMethod, paymentMethods, isConnected, selectedPaymentMethod]);

  const handleWalletConnect = async () => {
    try {
      await connect();
      await refetchPaymentMethods(); // Refresh payment methods after connect
      toast({
        description: 'Wallet connected successfully!',
        style: { backgroundColor: '#10B981', color: 'white' },
      });
      // Close the modal after successful connection
      setAddPaymentModalOpen(false);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      let errorMessage = error?.message || 'Failed to connect wallet. Please try again.';
      
      if (errorMessage.includes('Phantom wallet not found')) {
        toast({
          description: (
            <div className="space-y-2">
              <p>{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://phantom.com/', '_blank')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Phantom Wallet
              </Button>
            </div>
          ),
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Fetch SOL price with caching (only fetch if older than 30 seconds)
  const fetchSolPrice = async (force = false) => {
    const now = Date.now();
    const cacheTime = 30000; // 30 seconds
    
    if (!force && solPrice && (now - lastSolPriceFetch) < cacheTime) {
      return; // Use cached price
    }

    setLoadingSolPrice(true);
    try {
      const response = await fetch('/api/sol-price');
      const data = await response.json();
      setSolPrice(data.price);
      setLastSolPriceFetch(now);
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
    } finally {
      setLoadingSolPrice(false);
    }
  };

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!publicKey) return;
    
    setLoadingBalance(true);
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      const connection = new Connection(config.rpcUrl);
      
      const balance = await connection.getBalance(new PublicKey(publicKey));
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      setWalletBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Load wallet balance on connection (only once)
  useEffect(() => {
    if (isConnected && publicKey) {
      fetchWalletBalance();
    } else {
      setWalletBalance(null);
    }
  }, [isConnected, publicKey]);

  // No automatic SOL price fetching - only manual refresh

  // Load SOL price when crypto tab is opened (only if not already loaded)
  const loadSolPriceIfNeeded = useCallback(() => {
    if (purchaseMethod === 'crypto' && isConnected && publicKey && !solPrice && !loadingSolPrice) {
      fetchSolPrice();
    }
  }, [purchaseMethod, isConnected, publicKey, solPrice, loadingSolPrice]);

  // Load SOL price when switching to crypto tab
  useEffect(() => {
    if (purchaseMethod === 'crypto') {
      loadSolPriceIfNeeded();
    }
  }, [purchaseMethod, loadSolPriceIfNeeded]);

  // Refresh wallet data when needed (not on every input change)
  const refreshWalletData = async () => {
    if (isConnected && publicKey) {
      await Promise.all([
        fetchWalletBalance(),
        fetchSolPrice(true) // Force refresh
      ]);
    }
  };

  // Simple input handler that doesn't cause re-renders
  const handleAmountChange = useCallback((value: string) => {
    // Only allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPurchaseAmount(value);
    }
  }, []);

  // Memoized input component to prevent re-renders
  const AmountInput = useCallback(({ 
    id, 
    placeholder, 
    value, 
    onChange 
  }: { 
    id: string; 
    placeholder: string; 
    value: string; 
    onChange: (value: string) => void; 
  }) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // Only allow numbers and one decimal point
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        onChange(newValue);
      }
    }, [onChange]);

    return (
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        min="1"
        max="1000"
        step="0.01"
        value={value}
        onChange={handleChange}
        className="text-right"
      />
    );
  }, []);

  const validatePurchase = async () => {
    if (!purchaseAmount || !selectedPaymentMethod) {
      toast({
        title: 'Missing Information',
        description: 'Please select both amount and payment method',
        variant: 'destructive',
      });
      return false;
    }

    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than $0',
        variant: 'destructive',
      });
      return false;
    }

    if (amount < 0.10) {
      toast({
        title: 'Minimum Amount Required',
        description: 'Minimum purchase amount is $0.10',
        variant: 'destructive',
      });
      return false;
    }

    if (amount > 1000) {
      toast({
        title: 'Maximum Amount Exceeded',
        description: 'Maximum purchase amount is $1,000.00 per transaction',
        variant: 'destructive',
      });
      return false;
    }

    // For crypto payments, check wallet balance
    if (purchaseMethod === 'crypto' && selectedPaymentMethod === 'wallet') {
      if (walletBalance === null || solPrice === null) {
        toast({
          title: 'Balance Check Required',
          description: 'Please wait while we verify your wallet balance.',
          variant: 'destructive',
        });
        return false;
      }

      const requiredSol = amount / solPrice; // Real SOL conversion based on current price
      const buffer = 0.01; // Small buffer for transaction fees
      
      if (walletBalance < (requiredSol + buffer)) {
        toast({
          title: 'Insufficient Wallet Balance',
          description: `You need at least ${(requiredSol + buffer).toFixed(4)} SOL (≈$${amount} + fees) to complete this purchase. Current balance: ${walletBalance.toFixed(4)} SOL`,
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handlePurchaseCredits = async () => {
    const isValid = await validatePurchase();
    if (!isValid) return;

    // Calculate estimated credits (1 USD = 1 credit)
    const estimatedCredits = Math.floor(parseFloat(purchaseAmount));
    
    // Get payment method details
    const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
    const methodName = paymentMethod?.type === 'card' 
      ? `**** ${paymentMethod.last4} (${paymentMethod.brand?.toUpperCase()})`
      : 'Phantom Wallet';

    // Set transaction details for confirmation
    setTransactionDetails({
      amount: purchaseAmount,
      method: methodName,
      type: purchaseMethod,
      estimatedCredits,
    });

    // Show confirmation modal
    setPurchaseModalOpen(false);
    setConfirmationModalOpen(true);
  };

  const processCryptoPayment = async (usdAmount: number) => {
    if (!publicKey || !solPrice) {
      throw new Error('Wallet not properly connected');
    }

    try {
      // Fetch config for treasury address
      const configResponse = await fetch('/api/config');
      const config = await configResponse.json();
      
      if (!config.daoTreasuryAddress) {
        throw new Error('Treasury address not configured');
      }

      // Get Phantom provider
      const { solana } = window as any;
      if (!solana?.isPhantom) {
        throw new Error('Phantom wallet not found');
      }

      const connection = createEnhancedConnection(config.rpcUrl);
      const fromPubkey = new PublicKey(publicKey);
      const toPubkey = new PublicKey(config.daoTreasuryAddress);
      
      // Calculate SOL amount needed
      const solAmount = usdAmount / solPrice;
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      toast({
        title: 'Confirm Transaction',
        description: 'Please approve the transaction in your Phantom wallet.',
      });

      // Use the existing transaction utility for consistency
      const result = await executeTransactionWithRetry({
        connection,
        fromPubkey,
        toPubkey,
        platformPubkey: toPubkey, // For credits, platform gets the payment
        sellerAmount: 0, // No seller for credit purchases
        platformFee: lamports, // Full amount goes to platform
        solana,
      });

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      toast({
        title: 'Transaction Confirmed!',
        description: 'Payment processed successfully on the blockchain.',
      });

      return {
        signature: result.signature,
        solAmount,
        lamports,
      };

    } catch (error: any) {
      console.error('Crypto payment failed:', error);
      throw new Error(error.message || 'Failed to process crypto payment');
    }
  };

  const confirmPurchase = async () => {
    if (!transactionDetails) return;

    setIsProcessing(true);
    
    try {
      const usdAmount = parseFloat(transactionDetails.amount);

      if (transactionDetails.type === 'fiat') {
        // Handle fiat payment - would integrate with Stripe
        toast({
          title: 'Processing Payment',
          description: `Processing $${transactionDetails.amount} credit purchase...`,
        });

        // Simulate Stripe payment
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast({
          title: 'Payment Successful!',
          description: `Successfully purchased ${transactionDetails.estimatedCredits} credits via ${transactionDetails.method}`,
          style: { backgroundColor: '#10B981', color: 'white' },
        });
      } else {
        // Handle crypto payment with actual Solana transaction
        const result = await processCryptoPayment(usdAmount);

        // Call backend API to record the credit purchase
        // This should be implemented in your backend
        const creditResponse = await fetch('/api/crypto-credit-purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            amount: usdAmount,
            credits: transactionDetails.estimatedCredits,
            txSignature: result.signature,
            solAmount: result.solAmount,
            walletAddress: publicKey,
          }),
        });

        if (!creditResponse.ok) {
          throw new Error('Failed to record credit purchase');
        }

        toast({
          title: 'Transaction Confirmed!',
          description: `Successfully purchased ${transactionDetails.estimatedCredits} credits! Transaction: ${result.signature.slice(0, 8)}...`,
          style: { backgroundColor: '#10B981', color: 'white' },
        });
      }
      
      setConfirmationModalOpen(false);
      setPurchaseAmount('');
      setSelectedPaymentMethod('');
      setTransactionDetails(null);
      await refetchCredit();
      await fetchWalletBalance(); // Refresh balance after transaction
      
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Transaction failed. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const CreditPurchaseModal = () => (
    <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Add credits to your account using fiat or cryptocurrency
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <Tabs 
            value={purchaseMethod} 
            onValueChange={(v) => {
              setPurchaseMethod(v as 'fiat' | 'crypto');
              // Auto-select appropriate payment method
              if (v === 'crypto' && isConnected) {
                setSelectedPaymentMethod('wallet');
              } else if (v === 'fiat') {
                const defaultCard = paymentMethods.find(pm => pm.type === 'card' && pm.isDefault);
                if (defaultCard) {
                  setSelectedPaymentMethod(defaultCard.id);
                }
              }
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fiat" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Fiat (USD)
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Crypto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="fiat" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <AmountInput
                  id="amount"
                  placeholder="25.00"
                  value={purchaseAmount}
                  onChange={handleAmountChange}
                />
              </div>
              
              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {['10', '25', '50', '100'].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setPurchaseAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              
              {/* Payment method selection */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="space-y-2">
                  {paymentMethods
                    .filter(pm => pm.type === 'card')
                    .map((method) => (
                      <div 
                        key={method.id} 
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPaymentMethod === method.id 
                            ? 'border-primary bg-primary' 
                            : 'border-border'
                        }`}>
                          {selectedPaymentMethod === method.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <CreditCard className="h-4 w-4" />
                          <span>**** **** **** {method.last4} ({method.brand?.toUpperCase()})</span>
                          {method.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-4 mt-4">
              {isConnected ? (
                <>
                  {/* Wallet Info */}
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Wallet Info</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshWalletData}
                        disabled={loadingBalance || loadingSolPrice}
                      >
                        {(loadingBalance || loadingSolPrice) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Balance:</span>
                        <span>{walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : 'Loading...'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SOL Price:</span>
                        <span className="flex items-center gap-1">
                          {loadingSolPrice ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading...
                            </>
                          ) : solPrice ? (
                            `$${solPrice.toFixed(2)}`
                          ) : (
                            'Not loaded'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crypto-amount">Amount (USD)</Label>
                                      <AmountInput
                    id="crypto-amount"
                    placeholder="25.00"
                    value={purchaseAmount}
                    onChange={handleAmountChange}
                  />
                  </div>
                  
                  {/* Quick amount buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {['10', '25', '50', '100'].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setPurchaseAmount(amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'wallet' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPaymentMethod('wallet')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === 'wallet' 
                          ? 'border-primary bg-primary' 
                          : 'border-border'
                      }`}>
                        {selectedPaymentMethod === 'wallet' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <Wallet className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Connected Wallet</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatAddress(publicKey || '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Wallet Not Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your Phantom wallet to purchase credits with crypto
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setPurchaseModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchaseCredits}
              disabled={!purchaseAmount || !selectedPaymentMethod}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Purchase Credits
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const AddPaymentMethodModal = () => (
    <Dialog open={addPaymentModalOpen} onOpenChange={setAddPaymentModalOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            Add a new payment method to your account
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="card" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit Card
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Crypto Wallet
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <CardManager />
            </div>
          </TabsContent>
          
          <TabsContent value="wallet" className="space-y-4">
            {isConnected ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Wallet Already Connected</h3>
                <p className="text-muted-foreground mb-4">
                  Your Phantom wallet is connected and ready to use for payments
                </p>
                <div className="p-3 bg-muted rounded-lg mb-4">
                  <p className="text-sm font-mono">{formatAddress(publicKey || '')}</p>
                </div>
                <Button 
                  onClick={() => setAddPaymentModalOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Connect Phantom Wallet</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your Phantom wallet to use crypto for payments
                </p>
                
                {typeof window !== 'undefined' && !(window as any)?.solana?.isPhantom ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        Phantom wallet not detected. Please install Phantom wallet to continue.
                      </p>
                    </div>
                    <Button
                      onClick={() => window.open('https://phantom.com/', '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install Phantom Wallet
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Phantom Wallet
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  const ConfirmationModal = () => (
    <Dialog open={confirmationModalOpen} onOpenChange={setConfirmationModalOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Confirm Purchase
          </DialogTitle>
          <DialogDescription>
            Please review your purchase details before proceeding
          </DialogDescription>
        </DialogHeader>
        
        {transactionDetails && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">${transactionDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Credits:</span>
                <span className="font-medium">{transactionDetails.estimatedCredits.toLocaleString()}</span>
              </div>
              {transactionDetails.type === 'crypto' && solPrice && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">SOL Amount:</span>
                  <span className="font-medium">
                    {(parseFloat(transactionDetails.amount) / solPrice).toFixed(4)} SOL
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="font-medium text-sm">{transactionDetails.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{transactionDetails.type}</span>
              </div>
              {transactionDetails.type === 'crypto' && walletBalance !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Balance:</span>
                  <span className="font-medium">
                    {walletBalance.toFixed(4)} SOL
                  </span>
                </div>
              )}
            </div>

            {transactionDetails.type === 'crypto' && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Crypto Transaction Notice
                  </span>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  This transaction will be processed on the Solana blockchain. Transaction fees may apply.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setConfirmationModalOpen(false);
                  setPurchaseModalOpen(true);
                }}
                disabled={isProcessing}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={confirmPurchase}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Purchase
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Account Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Account Balance
          </CardTitle>
          <CardDescription>Your current credit balance and account status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credits */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                  <p className="text-3xl font-bold">{credit?.toLocaleString() || '0'}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              
              <Button 
                onClick={() => setPurchaseModalOpen(true)}
                className="w-full"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Purchase Credits
              </Button>
            </div>

            {/* Subscription Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <p className="text-lg font-semibold">
                    {isSubscribed ? 'Pro Plan' : 'Free Plan'}
                  </p>
                  {isSubscribed && subscriptionData?.data && (
                    <p className="text-sm text-muted-foreground">
                      Next billing: {subscriptionData.data.renewAt ? new Date(subscriptionData.data.renewAt).toLocaleDateString() : 'N/A'}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              {!isSubscribed && (
                <Button variant="outline" className="w-full" size="lg">
                  <Star className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your payment methods for credits and subscriptions</CardDescription>
            </div>
            <Button 
              onClick={() => setAddPaymentModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {method.type === 'card' ? (
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {method.type === 'card' 
                        ? `**** **** **** ${method.last4} (${method.brand?.toUpperCase()})` 
                        : `Phantom Wallet (${formatAddress(method.walletAddress || '')})`
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                      {method.type === 'wallet' && isConnected && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Connected</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {method.type === 'wallet' ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          // Refresh wallet balance and payment methods
                          await refreshWalletData();
                          await refetchPaymentMethods();
                          toast({
                            description: 'Wallet balance and payment methods refreshed',
                            style: { backgroundColor: '#10B981', color: 'white' },
                          });
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await disconnect();
                            await refetchPaymentMethods(); // Refresh payment methods after disconnect
                            toast({
                              description: 'Wallet disconnected successfully',
                              style: { backgroundColor: '#10B981', color: 'white' },
                            });
                          } catch (error: any) {
                            toast({
                              description: error?.message || 'Failed to disconnect wallet',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      {!method.isDefault && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {/* Show connect wallet option if not connected */}
            {!isConnected && paymentMethods.filter(pm => pm.type === 'card').length > 0 && (
              <div className="p-4 border border-dashed rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground">Crypto Wallet</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setAddPaymentModalOpen(true)}
                    variant="outline" 
                    size="sm"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            )}

            {paymentMethods.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-2">No payment methods added</p>
                <p className="text-sm text-muted-foreground">
                  Add a credit card or connect your crypto wallet to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legacy Components for Complex Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>Detailed subscription and billing management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SubscriptionStatus />
        </CardContent>
      </Card>

      {/* Modals */}
      <CreditPurchaseModal />
      <AddPaymentMethodModal />
      <ConfirmationModal />
    </div>
  );
};

export default UnifiedBilling;
