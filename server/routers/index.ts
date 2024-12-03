import { router } from '@/app/api/trpc/trpc-router';
import mainRouter from './main';
import panelRouter from './panel';
import paymentRouter from './payment';
import explorerRouter from './explorer';
import apiKeyRouter from './api-key';
import { organizationRouter } from './organization';
import dashboardRouter from './dashboard';
import explorerOptionsRouter from './explorer-options';
import { dndRouter } from './dnd';

export const appRouter = router({
  main: mainRouter,
  panel: panelRouter,
  apiKey: apiKeyRouter,
  payment: paymentRouter,
  explorer: explorerRouter,
  explorerOptions: explorerOptionsRouter,
  organization: organizationRouter,
  dashboard: dashboardRouter,
  dnd: dndRouter,
});
export type AppRouter = typeof appRouter;
