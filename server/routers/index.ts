import { mergeRouters } from '@/app/api/trpc/trpc-router';
import mainRouter from './main';
import panelRouter from './panel';
import paymentRouter from './payment';
import playgroundRouter from './playground';
import publicPlaygroundRouter from './public-playground';

export const appRouter = mergeRouters(
  mainRouter,
  panelRouter,
  paymentRouter,
  playgroundRouter,
  publicPlaygroundRouter
);
export type AppRouter = typeof appRouter;
