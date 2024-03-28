import {
  publicProcedure,
  router,
  userProcedure
} from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
const mainRouter = router({
  test: publicProcedure.query(({ input }) => {
    return { message: 'Hello World' };
  }),
  getUser: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user;
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized'
      });
    }
    const user_data = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (user_data.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user data'
      });
    }
    return {
      full_name: user_data.data.full_name,
    };
  })
});

export default mainRouter;
