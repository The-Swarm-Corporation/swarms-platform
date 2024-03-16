import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { SwarmApiModel } from '@/shared/models/db-types';
import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';
import panelRouter from './panel';
const playgroundRouter = router({
  playgroundListModels: userProcedure.query(async ({ ctx }) => {
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
          support_functions: model.support_functions
        }) as SwarmApiModel
    );
  }),
  getPlaygroundApiKey: userProcedure.query(async ({ ctx }) => {
    const currentPlaygroundApiKey = await supabaseAdmin
      .from('swarms_cloud_api_keys')
      .select('*')
      .eq('name', 'playground');

    let apiKey = currentPlaygroundApiKey.data?.[0]?.key;

    if (!apiKey) {
      const createCaller = createCallerFactory();
      const routerCaller = createCaller(panelRouter);
      const res = await routerCaller({}).addApiKey({ name: 'playground' });
      apiKey = res?.key;
    }
  })
});

export default playgroundRouter;
