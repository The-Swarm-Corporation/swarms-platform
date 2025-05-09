'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import {
  createContext,
  useContext,
  PropsWithChildren,
  useRef,
  useState,
  useEffect,
  RefObject,
} from 'react';

interface APIkeyProviderProps extends PropsWithChildren {
  isShareId?: boolean;
  isCreateAutoKey?: boolean
}
interface APIContextType {
  isInitializing: boolean;
  creationError: string | null;
  isCreatingApiKey: RefObject<boolean>;
  apiKey: string;
  isApiKeyLoading: boolean;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export const APIkeyProvider = ({
  children,
  isShareId = false,
  isCreateAutoKey = false
}: APIkeyProviderProps) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [creationError, setCreationError] = useState<string | null>(null);

  const isCreatingApiKey = useRef(false);

  const apiKeyQuery = trpc.apiKey.getValidApiKey.useQuery(
    { isShareId },
    {
      refetchOnWindowFocus: false,
    },
  );

  const createApiKeyMutation = trpc.apiKey.createDefaultApiKey.useMutation({
    onSuccess: () => {
      apiKeyQuery.refetch();
      isCreatingApiKey.current = false;
      setCreationError(null);
    },
    onError: (error) => {
      isCreatingApiKey.current = false;
      setCreationError(error.message);
      setIsInitializing(false);
    },
    onSettled: () => {
      if (!isCreatingApiKey.current) {
        setIsInitializing(false);
      }
    },
  });

  useEffect(() => {
    if (!apiKeyQuery.isLoading) {
      if (!apiKeyQuery.data && !isCreatingApiKey.current && isCreateAutoKey) {
        isCreatingApiKey.current = true;
        createApiKeyMutation.mutate();
      }
    }
  }, [apiKeyQuery.isLoading, apiKeyQuery.data, isCreateAutoKey]);

  return (
    <APIContext.Provider
      value={{
        isInitializing,
        isCreatingApiKey,
        creationError,
        apiKey: apiKeyQuery.data?.key || '',
        isApiKeyLoading: apiKeyQuery.isLoading,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};
export const useAPIKeyContext = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('setup must be used within a APIkeyProvider');
  }
  return context;
};
