import { router } from '@/app/api/trpc/trpc-router';
import mainRouter from './main';
import panelRouter from './panel';
import paymentRouter from './payment';
import publicPlaygroundRouter from './public-playground';
import explorerRouter from './explorer';
import apiKeyRouter from './api-key';
import { organizationRouter } from './organization';
import dashboardRouter from './dashboard';

export const appRouter = router({
  main: mainRouter,
  panel: panelRouter,
  apiKey: apiKeyRouter,
  payment: paymentRouter,
  publicPlayground: publicPlaygroundRouter,
  explorer: explorerRouter,
  organization: organizationRouter,
  dashboard: dashboardRouter,
});
export type AppRouter = typeof appRouter;
