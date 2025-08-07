'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useConfig } from '@/shared/hooks/use-config';

interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toString(): string } | null;
  isConnected: boolean;
  connect(options?: {
    onlyIfTrusted?: boolean;
  }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  on?(event: string, handler: (args: any) => void): void;
  removeListener?(event: string, handler: (args: any) => void): void;
}

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  solBalance: number;
  refreshBalance: () => Promise<void>;
  connectAndAuth?: () => Promise<void>;
  isAuthenticating?: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [solBalance, setSolBalance] = useState(0);

  const { rpcUrl, isLoading: configLoading } = useConfig();

  const getProvider = (): PhantomProvider | null => {
    if (typeof window !== 'undefined') {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        return solana;
      }

      if (solana && !solana.isPhantom) {
        console.warn('Non-Phantom Solana wallet detected');
      }
    }
    return null;
  };

  const connect = async () => {
    const provider = getProvider();
    if (!provider) {
      throw new Error(
        'Phantom wallet not found. Please install Phantom wallet from phantom.com',
      );
    }

    setIsConnecting(true);
    try {
      const response = await provider.connect();
      const walletAddress = response.publicKey.toString();
      setPublicKey(walletAddress);
      setIsConnected(true);
      await refreshBalance(walletAddress);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('phantom-disconnected');
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);

      if (error?.message?.includes('User rejected')) {
        throw new Error(
          'Connection cancelled. Please approve the connection in your Phantom wallet.',
        );
      } else if (error?.message?.includes('already pending')) {
        throw new Error(
          'Connection request already pending. Please check your Phantom wallet.',
        );
      } else if (error?.message?.includes('not found')) {
        throw new Error(
          'Phantom wallet not found. Please install Phantom wallet from phantom.com',
        );
      } else if (error?.code === 4001) {
        throw new Error(
          'Connection rejected. Please approve the connection in your Phantom wallet.',
        );
      } else {
        throw new Error(
          error?.message || 'Failed to connect wallet. Please try again.',
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.disconnect();

        if (typeof window !== 'undefined') {
          localStorage.removeItem('walletName');
          localStorage.removeItem('phantom-wallet');

          sessionStorage.removeItem('walletName');
          sessionStorage.removeItem('phantom-wallet');

          localStorage.setItem('phantom-disconnected', 'true');
        }

        if (provider.removeListener) {
          provider.removeListener('accountChanged', () => {});
          provider.removeListener('disconnect', () => {});
        }

      } catch (error) {
        console.error('Failed to disconnect wallet:', error);
      }
    }

    setPublicKey(null);
    setIsConnected(false);
    setSolBalance(0);
  };

  const refreshBalance = async (walletAddress?: string) => {
    const address = walletAddress || publicKey;
    if (!address || !rpcUrl) return;

    try {
      const connection = new Connection(rpcUrl);
      const pubKey = new PublicKey(address);
      const balance = await connection.getBalance(pubKey);
      setSolBalance(balance / 1e9);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  useEffect(() => {
    const autoConnect = async () => {
      const provider = getProvider();
      if (provider) {
        try {
          const wasDisconnected = typeof window !== 'undefined' &&
            localStorage.getItem('phantom-disconnected') === 'true';

          if (!wasDisconnected) {
            const response = await provider.connect({ onlyIfTrusted: true });
            if (response.publicKey) {
              const walletAddress = response.publicKey.toString();
              setPublicKey(walletAddress);
              setIsConnected(true);
              await refreshBalance(walletAddress);
            }
          }
        } catch (error) {
          console.log('Auto-connect failed:', error);
        }
      }
    };

    autoConnect();
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      const handleAccountChanged = (publicKey: PublicKey | null) => {
        if (publicKey) {
          const walletAddress = publicKey.toString();
          setPublicKey(walletAddress);
          setIsConnected(true);
          refreshBalance(walletAddress);
        } else {
          setPublicKey(null);
          setIsConnected(false);
          setSolBalance(0);
        }
      };

      provider.on?.('accountChanged', handleAccountChanged);

      return () => {
        provider.removeListener?.('accountChanged', handleAccountChanged);
      };
    }
  }, []);

  const connectAndAuth = async () => {
    setIsAuthenticating(true);
    try {
      await connect();

      console.log('Wallet connected, ready for authentication');
    } catch (error) {
      console.error('Connect and auth error:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const value: WalletContextType = {
    publicKey,
    isConnected,
    isConnecting,
    isAuthenticating,
    connect,
    disconnect,
    connectAndAuth,
    solBalance,
    refreshBalance: () => refreshBalance(),
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const usePhantomProvider = () => {
  const [provider, setProvider] = useState<PhantomProvider | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        setProvider(solana);
      }
    }
  }, []);

  return provider;
};
