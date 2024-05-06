import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { SwarmApiModel } from '@/shared/models/db-types';
import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';
import panelRouter from './panel';
import { generateApiKey } from '@/shared/utils/helpers';
const playgroundRouter = router({
  models: userProcedure.query(async ({ ctx }) => {
    const models = await supabaseAdmin
      .from('swarms_cloud_models')
      .select('*')
      .eq('enabled', true);

    return models.data?.map(
      (model) =>
        ({
          id: model.id,
          name: model.name,
          unique_name: model.unique_name,
          model_type: model.model_type,
          support_functions: model.support_functions,
          api_endpoint: model.api_endpoint,
        }) as SwarmApiModel,
    );
  }),
  getPlaygroundApiKey: userProcedure.query(async ({ ctx }) => {
    const currentPlaygroundApiKey = await supabaseAdmin
      .from('swarms_cloud_api_keys')
      .select('*')
      .eq('name', 'playground')
      .single();

    if (!currentPlaygroundApiKey?.data) {
      const user = ctx.session.data?.session?.user;
      if (!user) {
        throw new Error('User not found');
      }
      const key = generateApiKey();
      await ctx.supabase
        .from('swarms_cloud_api_keys')
        .insert({ name: 'playground', key, user_id: user.id });

      return key;
    }
    return currentPlaygroundApiKey.data?.key;
  }),
});

export default playgroundRouter;
