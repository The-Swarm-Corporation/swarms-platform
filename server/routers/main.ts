import {
  publicProcedure,
  router,
  userProcedure
} from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
const mainRouter= router({
  test: publicProcedure.query(({ input }) => {
    return { message: 'Hello World' };
  })
});

export default mainRouter;