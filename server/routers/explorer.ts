import {
  publicProcedure,
  router,
  userProcedure
} from '@/app/api/trpc/trpc-router';
import { promise } from 'zod';

const explorerRouter = router({
  getModels: publicProcedure.query(async ({ ctx }) => {
    const models = await ctx.supabase
      .from('swarms_cloud_models')
      .select('*')
      .eq('enabled', true);
    return models;
  }),
  synthifyMagicLink: userProcedure.mutation(async ({ ctx, input }) => {
    const user = ctx.session.data.session?.user;
    const secret_key = process.env.SYNTHIFY_SECRET_KEY;
    const SYNTHIFY_BACKEND_URL = process.env.SYNTHIFY_BACKEND_URL;
    const SYNTHIFY_FRONTEND_URL = process.env.SYNTHIFY_FRONTEND_URL;
    if (!secret_key) {
      throw 'missing secret key';
    }
    let payload = {
      secret_key,
      email: user?.email,
      external_user_id: user?.id
    };

    let body = JSON.stringify(payload);

    const path = `${SYNTHIFY_BACKEND_URL}/trpc/user.externalAuth`;
    const res = await fetch(path, {
      headers: {
        'content-type': 'application/json'
      },
      body: body,
      method: 'POST'
    }).then((res) => res.json());
    const data = res?.result?.data;
    if(res?.error?.message){
      throw res.error.message;
    }
    if (data) {
      return `${SYNTHIFY_FRONTEND_URL}/auth?token=${data}`;
    } else {
      // invalid response
      throw 'invalid response';
    }
  })
});

export default explorerRouter;
