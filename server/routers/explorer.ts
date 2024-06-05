import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
import {
  getSwarmPullRequestStatus,
  publishSwarmToGithub,
} from '@/shared/utils/api/swarm-publisher-github';
import { Tables } from '@/types_db';
import { z } from 'zod';

const explorerRouter = router({
  getModels: publicProcedure.query(async ({ ctx }) => {
    const models = await ctx.supabase
      .from('swarms_cloud_models')
      .select(
        'id,name,unique_name,model_type,description,tags,slug,price_million_input,price_million_output',
      )
      .eq('enabled', true)
      .order('created_at', { ascending: false });
    return models;
  }),
  getModelBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const model = await ctx.supabase
        .from('swarms_cloud_models')
        .select(
          'id,name,unique_name,model_type,description,tags,use_cases,model_card_md,slug,price_million_input,price_million_output',
        )
        .eq('slug', input)
        .eq('enabled', true)
        .single();
      return model.data;
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
      external_user_id: user?.id,
    };

    let body = JSON.stringify(payload);

    const path = `${SYNTHIFY_BACKEND_URL}/trpc/user.externalAuth`;
    const res = await fetch(path, {
      headers: {
        'content-type': 'application/json',
      },
      body: body,
      method: 'POST',
    }).then((res) => res.json());
    const data = res?.result?.data;
    if (res?.error?.message) {
      throw res.error.message;
    }
    if (data) {
      return `${SYNTHIFY_FRONTEND_URL}/auth?token=${data}`;
    } else {
      // invalid response
      throw 'invalid response';
    }
  }),

  // swarm
  validateSwarmName: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const name = input;
      // name validation
      // only a-z, 0-9, _
      if (!/^[a-zA-Z0-9_ ]+$/.test(name)) {
        return {
          error: 'Invalid name, only a-z, 0-9, _ are allowed',
          valid: false,
        };
      }
      // at least 5 characters
      if (name.length < 5) {
        return {
          error: 'Name should be at least 5 characters',
          valid: false,
        };
      }

      const user_id = ctx.session.data.session?.user?.id || '';
      const swarm = await ctx.supabase
        .from('swarms_cloud_user_swarms')
        .select('*')
        .eq('name', name)
        .eq('user_id', user_id);
      const exists = (swarm.data ?? [])?.length > 0;
      return {
        valid: !exists,
        error: exists ? 'Name already exists' : '',
      };
    }),
  addSwarm: userProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        useCases: z.array(z.any()),
        tags: z.string().optional(),
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let name = input.name;

      const ownerEmail = ctx.session.data.session?.user?.email || '';
      // convert email to name , fully , replace any non a-z, 0-9, _ with _
      const ownerName = ownerEmail.replace(/[^a-zA-Z0-9_]/g, '_');

      // validate name , it should be a valid directroy name, a-z, 0-9, _
      if (!/^[a-zA-Z0-9_ ]+$/.test(name)) {
        throw 'Invalid name, only a-z, 0-9, _ are allowed';
      }
      // replace none a-z 0-9 space,  with _
      name = name.replace(/[^a-zA-Z0-9_]/g, '_');
      name = name.replace(' ', '_');

      // rate limiter - 1 swarm per hour
      const user_id = ctx.session.data.session?.user?.id;
      const lastSubmites = await ctx.supabase
        .from('swarms')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1);
      if ((lastSubmites?.data ?? [])?.length > 0) {
        const lastSubmit = lastSubmites.data?.[0];
        const lastSubmitTime = new Date(lastSubmit?.created_at);
        const currentTime = new Date();
        const diff = currentTime.getTime() - lastSubmitTime.getTime();
        const diffHours = diff / (1000 * 60 * 60); // 1h
        if (diffHours < 1) {
          throw 'You can only submit one swarm per hour';
        }
      }
      // github stuff , make branch , add commits , create PR
      try {
        const res = await publishSwarmToGithub({
          name,
          code: input.code,
          ownerName,
          ownerEmail,
        });

        const swarm = await ctx.supabase
          .from('swarms_cloud_user_swarms')
          .insert([
            {
              name: name,
              use_cases: input.useCases,
              user_id: user_id,
              code: input.code,
              tags: input.tags,
              pr_id: res?.number || '',
              pr_link: res?._links.issue.href || '',
              description: input.description,
              status: 'pending',
            } as Tables<'swarms_cloud_user_swarms'>,
          ]);
        if (swarm.error) {
          throw swarm.error;
        }
        return true;
      } catch (e) {}
    }),
  // Validate prompt
  validatePrompt: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const prompt = input;
      // at least 5 characters
      if (prompt.length < 5) {
        return {
          error: 'Prompt should be at least 5 characters',
          valid: false,
        };
      }

      const user_id = ctx.session.data.session?.user?.id || '';
      const promptData = await ctx.supabase
        .from('swarms_cloud_prompts')
        .select('*')
        .eq('prompt', prompt)
        .eq('user_id', user_id);
      const exists = (promptData.data ?? [])?.length > 0;
      return {
        valid: !exists,
        error: exists ? 'Prompt already exists' : '',
      };
    }),

  // Add prompt
  addPrompt: userProcedure
    .input(
      z.object({
        name: z.string().optional(),
        prompt: z.string(),
        description: z.string().optional(),
        useCases: z.array(z.any()),
        tags: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.prompt) {
        throw 'Prompt is required';
      }

      // at least 5 characters
      if (!input.name || input.name.trim()?.length < 2) {
        throw 'Name should be at least 2 characters';
      }

      // rate limiter - 1 prompt per minute
      const user_id = ctx.session.data.session?.user?.id ?? '';
      const lastSubmits = await ctx.supabase
        .from('swarms_cloud_prompts')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if ((lastSubmits?.data ?? [])?.length > 0) {
        const lastSubmit = lastSubmits.data?.[0] || { created_at: new Date() };
        const lastSubmitTime = new Date(lastSubmit.created_at);
        const currentTime = new Date();
        const diff = currentTime.getTime() - lastSubmitTime.getTime();
        const diffMinutes = diff / (1000 * 60); // 1 minute
        if (diffMinutes < 1) {
          throw 'You can only submit one prompt per minute';
        }
      }

      try {
        const prompts = await ctx.supabase.from('swarms_cloud_prompts').insert([
          {
            name: input.name,
            use_cases: input.useCases,
            prompt: input.prompt,
            description: input.description,
            user_id: user_id,
            tags: input.tags,
            status: 'pending',
          } as Tables<'swarms_cloud_prompts'>,
        ]);
        if (prompts.error) {
          throw prompts.error;
        }
        return true;
      } catch (e) {
        console.error(e);
        throw "Couldn't add prompt";
      }
    }),
  getAllPrompts: publicProcedure.query(async ({ ctx }) => {
    const prompts = await ctx.supabase
      .from('swarms_cloud_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    return prompts;
  }),
  getPromptById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const model = await ctx.supabase
        .from('swarms_cloud_prompts')
        .select('*')
        .eq('id', input)
        .single();
      return model.data;
    }),

  reloadSwarmStatus: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const swarm = await ctx.supabase
        .from('swarms_cloud_user_swarms')
        .select('*')
        .eq('id', input);
      if (swarm.data?.length === 0) {
        throw 'Swarm not found';
      }
      // if its already approved, no need to check
      const oldStatus = swarm.data?.[0].status;
      if (oldStatus === 'approved') {
        return 'approved';
      }
      const pr_id = swarm.data?.[0].pr_id;
      if (!pr_id) {
        throw 'PR not found';
      }
      const pr_status = await getSwarmPullRequestStatus(pr_id);
      let status: 'approved' | 'pending' | 'rejected' = 'pending';
      if (typeof pr_status != 'boolean' && pr_status.closed_at) {
        if (pr_status.merged) {
          status = 'approved';
        } else {
          status = 'rejected';
        }
      }
      // update status
      await ctx.supabase
        .from('swarms_cloud_user_swarms')
        .update({ status })
        .eq('id', input);
      return status;
    }),
  getMyPendingSwarms: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.session?.user?.id || '';
    const swarms = await ctx.supabase
      .from('swarms_cloud_user_swarms')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'pending');
    return swarms;
  }),
  getAllApprovedSwarms: userProcedure.query(async ({ ctx }) => {
    const swarms = await ctx.supabase
      .from('swarms_cloud_user_swarms')
      .select('id,name,description')
      .eq('status', 'approved');
    return swarms;
  }),
  getSwarmByName: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const swarm = await ctx.supabase
        .from('swarms_cloud_user_swarms')
        .select('id,name,description,use_cases,tags,status')
        .eq('name', input)
        .eq('status', 'approved');
      return swarm.data?.[0];
    }),
});

export default explorerRouter;
