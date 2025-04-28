import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
import { extractCategories } from '@/shared/utils/helpers';
import { Tables } from '@/types_db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const BUCKET_NAME = 'images';

const explorerRouter = router({
  getExplorerData: publicProcedure
    .input(
      z.object({
        includePrompts: z.boolean().default(true),
        includeAgents: z.boolean().default(true),
        includeTools: z.boolean().default(true),
        limit: z.number().default(6),
        offset: z.number().default(0),
        search: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        includePrompts,
        includeAgents,
        includeTools,
        limit,
        offset,
        search,
        category,
      } = input;

      let prompts: any[] = [];
      let agents: any[] = [];
      let tools: any[] = [];

      if (includePrompts) {
        let query = ctx.supabase
          .from('swarms_cloud_prompts')
          .select('*')
          .order('created_at', { ascending: false });

        if (search) {
          query = query
            .ilike('name', `%${search}%`)
            .or(`prompt.ilike.%${search}%`);
        }

        const { data, error } = await query.range(offset, offset + limit - 1);
        if (error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        prompts = data ?? [];
      }

      if (includeAgents) {
        let query = ctx.supabase
          .from('swarms_cloud_agents')
          .select('*')
          .order('created_at', { ascending: false });

        if (category && category.toLowerCase() !== 'all') {
          query = query.or(`tags.ilike.%${category}%`);
        }

        if (search) {
          query = query
            .ilike('name', `%${search}%`)
            .or(`description.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        agents = data ?? [];
      }

      if (includeTools) {
        let query = ctx.supabase
          .from('swarms_cloud_tools')
          .select('*')
          .order('created_at', { ascending: false });

        if (search) {
          query = query
            .ilike('name', `%${search}%`)
            .or(`description.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        tools = data ?? [];
      }

      return { prompts, agents, tools };
    }),

  getAgentTags: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('swarms_cloud_agents')
      .select('tags')
      .not('tags', 'is', null);

    if (error) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
    }

    const categories = extractCategories(data ?? []);
    return { categories: ['all', ...categories] };
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

      const user_id = ctx.session.data.user?.id || '';
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
        useCases: z.array(z.any()).optional(),
        imageUrl: z.string().optional(),
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
      const user_id = ctx.session.data.user?.id ?? '';
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
      }

      try {
        const prompts = await ctx.supabase.from('swarms_cloud_prompts').insert([
          {
            name: input.name,
            use_cases: input.useCases,
            prompt: input.prompt,
            description: input.description,
            user_id: user_id,
            image_url: input.imageUrl || null,
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

  // Update prompt
  updatePrompt: userProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        prompt: z.string().optional(),
        description: z.string().optional(),
        useCases: z.array(z.any()).optional(),
        imageUrl: z.string().optional(),
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

      const user_id = ctx.session.data.user?.id ?? '';

      try {
        const prompt = await ctx.supabase
          .from('swarms_cloud_prompts')
          .update({
            name: input.name,
            use_cases: input.useCases,
            prompt: input.prompt,
            description: input.description,
            tags: input.tags,
            image_url: input.imageUrl || null,
          } as Tables<'swarms_cloud_prompts'>)
          .eq('user_id', user_id)
          .eq('id', input.id)
          .select('*');

        if (prompt.error) {
          throw prompt.error;
        }
        return true;
      } catch (e) {
        console.error(e);
        throw 'Prompt could not be updated';
      }
    }),

  getAllPrompts: publicProcedure
    .input(
      z.object({
        limit: z.number().default(6),
        offset: z.number().default(1),
        search: z.string().optional(), // Add search as an optional parameter
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, search } = input;

      let query = ctx.supabase
        .from('swarms_cloud_prompts')
        .select('*')
        .order('created_at', { ascending: false });

      // If a search query is provided, filter based on name or prompt fields
      if (search) {
        query = query
          .ilike('name', `%${search}%`)
          .or(`prompt.ilike.%${search}%`);
      }

      const prompts = await query.range(offset, offset + limit - 1);

      if (prompts.error) {
        console.error(prompts.error);
        throw prompts.error.message;
      }

      return prompts;
    }),
  getUserPrompts: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_prompts')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
  validateAgent: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const agent = input;
      // at least 5 characters
      if (agent.length < 5) {
        return {
          error: 'Agent should be at least 5 characters',
          valid: false,
        };
      }

      const user_id = ctx.session.data.user?.id || '';
      const agentData = await ctx.supabase
        .from('swarms_cloud_agents')
        .select('*')
        .eq('agent', agent)
        .eq('user_id', user_id);
      const exists = (agentData.data ?? [])?.length > 0;
      return {
        valid: !exists,
        error: exists ? 'Agent already exists' : '',
      };
    }),
  // Add agent
  addAgent: userProcedure
    .input(
      z.object({
        name: z.string(),
        agent: z.string(),
        language: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.any()).optional(),
        useCases: z.array(z.any()).optional(),
        imageUrl: z.string().optional(),
        tags: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.description) {
        throw 'Description is required';
      }

      // at least 5 characters
      if (!input.name || input.name.trim()?.length < 2) {
        throw 'Name should be at least 2 characters';
      }

      // rate limiter - 1 agent per minute
      const user_id = ctx.session.data.user?.id ?? '';
      const lastSubmits = await ctx.supabase
        .from('swarms_cloud_agents')
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
          throw 'You can only submit one agent per minute';
        }
      }

      try {
        const agents = await ctx.supabase.from('swarms_cloud_agents').insert([
          {
            name: input.name || null,
            description: input.description || null,
            user_id: user_id,
            use_cases: input.useCases,
            agent: input.agent,
            requirements: input.requirements,
            tags: input.tags || null,
            language: input.language,
            image_url: input.imageUrl || null,
            status: 'pending',
          } as Tables<'swarms_cloud_agents'>,
        ]);
        if (agents.error) {
          throw agents.error;
        }
        return true;
      } catch (e) {
        console.error(e);
        throw "Couldn't add agent";
      }
    }),
  // Update agent
  updateAgent: userProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        agent: z.string().optional(),
        language: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.any()).optional(),
        useCases: z.array(z.any()),
        tags: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.description) {
        throw 'Description is required';
      }

      // at least 5 characters
      if (!input.name || input.name.trim()?.length < 2) {
        throw 'Name should be at least 2 characters';
      }

      const user_id = ctx.session.data.user?.id ?? '';

      try {
        const agent = await ctx.supabase
          .from('swarms_cloud_agents')
          .update({
            name: input.name,
            description: input.description,
            use_cases: input.useCases,
            agent: input.agent,
            requirements: input.requirements,
            tags: input.tags,
            language: input.language,
            image_url: input.imageUrl || null,
          } as Tables<'swarms_cloud_agents'>)
          .eq('user_id', user_id)
          .eq('id', input.id)
          .select('*');

        if (agent.error) {
          throw agent.error;
        }

        if (!agent.data?.length) {
          throw new Error('Agent not found');
        }

        return true;
      } catch (e) {
        console.error(e);
        throw "Couldn't add agent";
      }
    }),
  getAllAgents: publicProcedure.query(async ({ ctx }) => {
    const agents = await ctx.supabase
      .from('swarms_cloud_agents')
      .select('*')
      .order('created_at', { ascending: false });

    return agents;
  }),
  getAgentById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const agents = await ctx.supabase
        .from('swarms_cloud_agents')
        .select('*')
        .eq('id', input)
        .single();
      return agents.data;
    }),
  getAgentsByUserId: userProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const agents = await ctx.supabase
        .from('swarms_cloud_agents')
        .select('*')
        .eq('user_id', input)
        .order('created_at', { ascending: false });
      return agents;
    }),
  //tools
  validateTool: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const tool = input;
      if (tool.length < 3) {
        return {
          error: 'Tool should be at least 3 characters',
          valid: false,
        };
      }

      const user_id = ctx.session.data.user?.id || '';
      const toolData = await ctx.supabase
        .from('swarms_cloud_tools')
        .select('*')
        .eq('tool', tool)
        .eq('user_id', user_id);
      const exists = (toolData.data ?? [])?.length > 0;
      return {
        valid: !exists,
        error: exists ? 'Tool already exists' : '',
      };
    }),
  // Add tool
  addTool: userProcedure
    .input(
      z.object({
        name: z.string(),
        tool: z.string(),
        language: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.any()),
        useCases: z.array(z.any()),
        tags: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.description) {
        throw 'Description is required';
      }

      if (!input.name || input.name.trim()?.length < 2) {
        throw 'Name should be at least 2 characters';
      }

      // rate limiter - 1 tool per 30 secs
      const user_id = ctx.session.data.user?.id ?? '';
      const lastSubmits = await ctx.supabase
        .from('swarms_cloud_tools')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if ((lastSubmits?.data ?? [])?.length > 0) {
        const lastSubmit = lastSubmits.data?.[0] || { created_at: new Date() };
        const lastSubmitTime = new Date(lastSubmit.created_at);
        const currentTime = new Date();
        const diff = currentTime.getTime() - lastSubmitTime.getTime();
        const diffMinutes = diff / (1000 * 30); // 30 secs
        if (diffMinutes < 1) {
          throw 'You can only submit one tool per 30 secs';
        }
      }

      try {
        const tools = await ctx.supabase.from('swarms_cloud_tools').insert([
          {
            name: input.name || null,
            description: input.description || null,
            user_id: user_id,
            use_cases: input.useCases,
            tool: input.tool,
            requirements: input.requirements,
            tags: input.tags || null,
            language: input.language,
            status: 'pending',
            image_url: input.imageUrl || null,
          } as Tables<'swarms_cloud_tools'>,
        ]);
        if (tools.error) {
          throw tools.error;
        }
        return true;
      } catch (e) {
        console.error(e);
        throw "Couldn't add tool";
      }
    }),
  // Update tool
  updateTool: userProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        tool: z.string().optional(),
        language: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.any()).optional(),
        useCases: z.array(z.any()),
        tags: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.description) {
        throw 'Description is required';
      }

      // at least 5 characters
      if (!input.name || input.name.trim()?.length < 2) {
        throw 'Name should be at least 2 characters';
      }

      const user_id = ctx.session.data.user?.id ?? '';

      try {
        const tool = await ctx.supabase
          .from('swarms_cloud_tools')
          .update({
            name: input.name,
            description: input.description,
            use_cases: input.useCases,
            tool: input.tool,
            requirements: input.requirements,
            tags: input.tags,
            language: input.language,
            image_url: input.imageUrl || null,
          } as Tables<'swarms_cloud_tools'>)
          .eq('user_id', user_id)
          .eq('id', input.id)
          .select('*');

        if (tool.error) {
          throw tool.error;
        }

        if (!tool.data?.length) {
          throw new Error('Tool not found');
        }

        return true;
      } catch (e) {
        console.error(e);
        throw "Couldn't add tool";
      }
    }),
  getAllTools: publicProcedure.query(async ({ ctx }) => {
    const tools = await ctx.supabase
      .from('swarms_cloud_tools')
      .select('*')
      .order('created_at', { ascending: false });

    return tools;
  }),
  getToolById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const tool = await ctx.supabase
        .from('swarms_cloud_tools')
        .select('*')
        .eq('id', input)
        .single();
      return tool.data;
    }),
  deleteFile: userProcedure
    .input(
      z.object({
        filePath: z.string(),
        modelType: z.string(),
        imageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.data.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      if (
        !input.filePath.startsWith(
          `public/models/${input.modelType}/${input.imageId}/`,
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this file',
        });
      }

      try {
        const { error } = await ctx.supabase.storage
          .from(BUCKET_NAME)
          .remove([input.filePath]);

        if (error) {
          throw error;
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
          cause: error,
        });
      }
    }),
  checkReview: userProcedure
    .input(
      z.object({
        modelId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { modelId } = input;
      const user_id = ctx.session.data.user?.id ?? '';

      try {
        const { data, error } = await ctx.supabase
          .from('swarms_cloud_reviews')
          .select('id')
          .eq('user_id', user_id)
          .eq('model_id', modelId)
          .single();

        if (error && error.code === 'PGRST116') {
          return { hasReviewed: false };
        }

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while checking review',
          });
        }

        return { hasReviewed: !!data.id };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to check review`,
        });
      }
    }),

  addReview: userProcedure
    .input(
      z.object({
        model_type: z.string(),
        model_id: z.string(),
        rating: z.number(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { model_id, model_type, rating, comment } = input;
      const user_id = ctx.session.data.user?.id ?? '';

      try {
        const { data: existingReview, error: existingReviewError } =
          await ctx.supabase
            .from('swarms_cloud_reviews')
            .select('id')
            .eq('user_id', user_id)
            .eq('model_id', model_id)
            .single();

        if (existingReview?.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User has already reviewed this model',
          });
        }

        // Insert new review
        const newReview = await ctx.supabase
          .from('swarms_cloud_reviews')
          .insert([
            {
              user_id,
              model_id,
              model_type,
              rating,
              comment,
            },
          ]);

        if (newReview.error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to insert review',
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to insert review`,
        });
      }
    }),
  getReviews: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const modelId = input;

      try {
        const { data: reviews, error: reviewsError } = await ctx.supabase
          .from('swarms_cloud_reviews')
          .select(
            `
            id,
            comment,
            model_id,
            user_id,
            model_type,
            created_at,
            rating,
            users (
            full_name,
            username,
            email,
            avatar_url
            )
          `,
          )
          .eq('model_id', modelId)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while fetching reviews',
          });
        }

        return reviews;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch reviews`,
        });
      }
    }),
  getReviewsByIds: publicProcedure
    .input(z.object({ modelIds: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const { modelIds } = input;

      try {
        const { data: reviews, error: reviewsError } = await ctx.supabase
          .from('swarms_cloud_reviews')
          .select(
            `
            id,
            comment,
            model_id,
            user_id,
            model_type,
            created_at,
            rating,
            users (
              full_name,
              username,
              email,
              avatar_url
            )
          `,
          )
          .in('model_id', modelIds)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while fetching reviews',
          });
        }

        return reviews;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch reviews`,
        });
      }
    }),
  getPromptChats: userProcedure
    .input(z.object({ promptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { promptId } = input;
      const { data, error } = await ctx.supabase
        .from('swarms_cloud_prompts_chat')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('user_id', user_id)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    }),

  savePromptChat: userProcedure
    .input(
      z.array(
        z.object({
          text: z.string(),
          sender: z.string(),
          prompt_id: z.string(),
          response_id: z.any(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const formattedInput = input.map((entry) => ({
        ...entry,
        user_id,
      }));

      const { error } = await ctx.supabase
        .from('swarms_cloud_prompts_chat')
        .insert(formattedInput);

      if (error) throw new Error(error.message);
      return { success: true };
    }),

  editPromptChat: userProcedure
    .input(
      z.object({
        responseId: z.string(),
        userText: z.string(),
        agentText: z.string(),
        promptId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';
      const { responseId, userText, agentText, promptId } = input;

      const { error: updateError } = await ctx.supabase
        .from('swarms_cloud_prompts_chat')
        .update({ text: userText })
        .eq('response_id', responseId)
        .eq('prompt_id', promptId)
        .eq('user_id', user_id);

      if (updateError) throw new Error(updateError.message);

      const { error: agentUpdateError } = await ctx.supabase
        .from('swarms_cloud_prompts_chat')
        .update({ text: agentText })
        .eq('response_id', `${responseId}_agent`)
        .eq('prompt_id', promptId)
        .eq('user_id', user_id);

      if (agentUpdateError) throw new Error(agentUpdateError.message);

      return { success: true };
    }),

  deletePromptChat: userProcedure
    .input(
      z.object({
        messageId: z.string(),
        promptId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';
      const { error } = await ctx.supabase
        .from('swarms_cloud_prompts_chat')
        .delete()
        .eq('id', input.messageId)
        .eq('prompt_id', input.promptId)
        .eq('user_id', user_id);
      if (error) throw new Error(error.message);
      return { success: true };
    }),

  deductCredit: userProcedure
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { error } = await ctx.supabase.rpc('deduct_credit', {
        user_id,
        amount: input.amount,
      });

      if (error) {
        console.error(`Error deducting credit: ${error.message}`);
        throw new Error(`Failed to deduct user credit: ${error.message}`);
      }

      return { success: true };
    }),
  getUserExplorerItems: userProcedure.query(async ({ ctx }) => {
    const { data: prompts, error: promptsError } = await ctx.supabase
      .from('swarms_cloud_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (promptsError) throw promptsError;

    const { data: agents, error: agentsError } = await ctx.supabase
      .from('swarms_cloud_agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (agentsError) throw agentsError;

    const userPrompts = prompts.map((item) => ({
      ...item,
      itemType: 'prompt' as const,
    }));

    const userAgents = agents.map((agent) => ({
      ...agent,
      itemType: 'agent' as const,
    }));

    return {
      prompts: userPrompts || [],
      agents: userAgents || [],
      combinedItems: [...userPrompts, ...userAgents].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    };
  }),
});

export default explorerRouter;
