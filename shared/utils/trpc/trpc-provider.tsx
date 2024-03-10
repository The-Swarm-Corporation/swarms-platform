'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, getFetch, loggerLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './trpc';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { getURL } from '../helpers';

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const toaster = useToast();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5000 },
          mutations: {
            onError(error, variables, context) {
              toaster.toast({
                title: error.message,
                variant: 'destructive'
              });
            }
          }
        }
      })
  );

  const url = `${getURL()}/api/trpc/`;

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: () => true
        }),
        httpBatchLink({
          transformer: superjson,
          url,
          fetch: async (input, init?) => {
            const fetch = getFetch();
            return fetch(input, {
              ...init,
              credentials: 'include'
            });
          },
          headers() {
            return {};
          }
        })
      ]
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* <ReactQueryDevtools /> */}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
