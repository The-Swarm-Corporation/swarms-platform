import { publicProcedure, router } from '@/app/api/trpc/trpc-router';

const explorerRouter = router({
  getExplorerModels: publicProcedure.query(async ({ ctx }) => {
    const models = await ctx.supabase
      .from('swarms_cloud_models')
      .select('*')
      .eq('enabled', true);
    return models;
  })
});

export default explorerRouter;
