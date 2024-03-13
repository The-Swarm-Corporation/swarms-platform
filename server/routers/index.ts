import { mergeRouters } from '@/app/api/trpc/trpc-router';
import mainRouter from './main';
import panelRouter from './panel';
import paymentRouter from './payment';
import playgroundRouter from './playground';

export const appRouter = mergeRouters(
  mainRouter,
  panelRouter,
  paymentRouter,
  playgroundRouter
);
export type AppRouter = typeof appRouter;
