import {
  publicProcedure,
  router,
  userProcedure
} from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
const panelRouter = router({});

export default panelRouter;
