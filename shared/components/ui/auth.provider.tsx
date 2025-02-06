'use client';

import { User } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';

interface AuthProviderProps extends PropsWithChildren {
  user: User | null;
}
interface AuthContextType extends AuthProviderProps {
  isAuthModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setIsAuthModalOpen: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, user }: AuthProviderProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!user);

  const openModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeModal = useCallback(() => setIsAuthModalOpen(false), []);

  useEffect(() => {
    setIsAuthModalOpen(!user);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthModalOpen,
        openModal,
        setIsAuthModalOpen,
        closeModal,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useModal must be used within a AuthProvider');
  }
  return context;
};
