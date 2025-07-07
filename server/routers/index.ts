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
import { agentRouter, chatRouter, fileUploadRouter, swarmConfigRouter } from './chat';
import referralRouter from './referral';
import marketplaceRouter from './marketplace';
import notificationsRouter from './notifications';

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
  chatAgent: agentRouter,
  chat: chatRouter,
  fileUpload: fileUploadRouter,
  swarmConfig: swarmConfigRouter,
  referral: referralRouter,
  marketplace: marketplaceRouter,
  notifications: notificationsRouter,
});
export type AppRouter = typeof appRouter;
