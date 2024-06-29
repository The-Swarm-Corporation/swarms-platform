'use client';

import { User } from '@supabase/supabase-js';
import { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthModalOpen: boolean;
  openModal: (view: string) => void;
  closeModal: () => void;
  user: User | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  user,
}: {
  children: ReactNode;
  user: User | null;
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openModal = () => setIsAuthModalOpen(true);
  const closeModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{ isAuthModalOpen, openModal, closeModal, user }}
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
