import {
  publicProcedure,
  router,
  userProcedure
} from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { User } from '@supabase/supabase-js';
import { generateApiKey } from '@/shared/utils/helpers';
const panelRouter = router({
  //
  getApiKeys: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const apiKeys = await ctx.supabase
      .from('swarms_cloud_api_keys')
      .select('id, name, created_at, key')
      .eq('user_id', user.id);
    // only show first 5 characters of key and last 5 characters of key
    return apiKeys.data?.map((row) => ({
      ...row,
      key: `${row?.key?.slice(0, 5)}.....${row?.key?.slice(-5)}`
    }));
  }),
  addApiKey: userProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.name.trim() == '') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Name is required'
        });
      }
      try {
        const user = ctx.session.data.session?.user as User;
        const key = generateApiKey();
        const newApiKey = await ctx.supabase
          .from('swarms_cloud_api_keys')
          .insert({ name: input.name, key, user_id: user.id });
        if (!newApiKey.error) {
          return {
            key,
            name: input.name
          };
        }
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while adding new api key'
        });
      }
    }),
  deleteApiKey: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.session?.user as User;
      const deletedApiKey = await ctx.supabase
        .from('swarms_cloud_api_keys')
        .delete()
        .eq('id', input)
        .eq('user_id', user.id);
      if (!deletedApiKey.error) {
        return true;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while deleting api key'
      });
    })
});

export default panelRouter;
