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

const promptRouter = router({
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

    // setPromptRating
    setPromptRating: userProcedure
        .input(
            z.object({
                rating: z.number().optional(),
                prompt_id: z.string().optional()
            }),
        )
        .mutation(async ({ ctx, input }) => {

            // rate limiter - 1 prompt per minute
            const user_id = ctx.session.data.session?.user?.id ?? '';
            const lastSubmits = await ctx.supabase
                .from('swarms_cloud_prompt_ratings')
                .select('*')
                .eq('user_id', user_id)
                .order('created_at', { ascending: false })
                .limit(1);

            if ((lastSubmits?.data ?? [])?.length > 0) {
                const lastSubmit = lastSubmits.data?.[0] || { created_at: new Date() };
                const lastSubmitTime = new Date(lastSubmit.created_at || new Date());
                const currentTime = new Date();
                const diff = currentTime.getTime() - lastSubmitTime.getTime();
                const diffMinutes = diff / (1000 * 60); // 1 minute
                if (diffMinutes < 1) {
                    throw 'You can only submit one prompt per minute';
                }
            }

            try {
                const prompts = await ctx.supabase.from('swarms_cloud_prompt_ratings').insert([
                    {
                        prompt_id: input.prompt_id,
                        user_id: user_id,
                        rating: input.rating
                    } as Tables<'swarms_cloud_prompt_ratings'>,
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

export default promptRouter;
