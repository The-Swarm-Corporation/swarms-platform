import { AppRouter } from '@/server/routers';
import { createTRPCReact } from '@trpc/react-query';
import {
  createTRPCProxyClient,
  getFetch,
  httpBatchLink,
  loggerLink,
} from '@trpc/client';
import { getURL } from '../helpers';
import SuperJSON from 'superjson';
const url = `${getURL()}/api/trpc/`;

export const trpcConfig: any = {
  links: [
    loggerLink({
      enabled: () => false,
    }),
    httpBatchLink({
      transformer: SuperJSON,
      url,
      fetch: async (input, init?) => {
        const fetch = getFetch();
        return fetch(input, {
          ...init,
          credentials: 'include',
        });
      },
      headers() {
        return {};
      },
    }),
  ],
};
export const trpc = createTRPCReact<AppRouter>();
export const trpcApi = createTRPCProxyClient<AppRouter>(trpcConfig);
