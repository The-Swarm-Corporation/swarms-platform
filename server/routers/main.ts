import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
import { PUBLIC } from '@/shared/utils/constants';
import { makeUrl } from '@/shared/utils/helpers';
import { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { z } from 'zod';

const applyFilters = (query: any, input: any) => {
  if (input.filterProperty && input.filterValue) {
    if (['created_at', 'updated_at'].includes(input.filterProperty)) {
      const date = parseValidDate(input.filterValue);
      if (date) {
        query = query.gte(input.filterProperty, date);
      }
    } else if (input.filterProperty === 'id') {
      query = query.eq('id', input.filterValue);
    }
  }

  return query;
};

const parseValidDate = (dateString: string) => {
  const parsedDate = dayjs(
    dateString,
    ['MM/DD/YYYY HH:mm', 'MM/DD/YYYY HH:mm:ss'],
    true,
  );
  return parsedDate.isValid() ? parsedDate.toISOString() : null;
};

const mainRouter = router({
  getUser: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user;
    if (!user) return null;
    const user_data = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (user_data.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user data',
      });
    }
    return {
      full_name: user_data.data.full_name,
      email: user.email,
      id: user.id,
      username: user_data.data.username,
    };
  }),
  getUserById: userProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      const user_data = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user_data.data?.email) return null;

      return {
        full_name: user_data.data.full_name,
        email: user_data.data.email,
        id: user_data.data.id,
        username: user_data.data.username,
        avatar: user_data.data.avatar_url,
      };
    }),
  getUsersByIds: userProcedure
    .input(z.object({ userIds: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const { userIds } = input;

      const { data: users, error } = await ctx.supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while fetching users',
        });
      }
      return users;
    }),
  updateUsername: userProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const username = input.username;
      const minLength = 3;
      const maxLength = 16;
      const regex = /^[a-zA-Z0-9_]+$/;

      if (username.length < minLength || username.length > maxLength) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Username must be between ${minLength} and ${maxLength} characters.`,
        });
      }

      if (!regex.test(username)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Username can only contain letters, numbers, and underscores.',
        });
      }

      if (username.includes('__') || username.includes('--')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Username cannot contain consecutive special characters.',
        });
      }

      const blackList = await ctx.supabase
        .from('swarms_cloud_blacklists')
        .select('list')
        .eq('type', 'username');

      if (blackList.data) {
        const blackListed = blackList.data.some((item) =>
          (item?.list as { usernames: string[] })?.usernames?.some((name) =>
            username.toLowerCase().includes(name.toLowerCase()),
          ),
        );
        if (blackListed) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This username is not available.',
          });
        }
      }

      const user = ctx.session.data.user as User;
      const updatedUsername = await ctx.supabase
        .from('users')
        .update(input)
        .eq('id', user.id);
      if (updatedUsername.error) {
        const message =
          updatedUsername.error.code === '23505'
            ? 'Username already exists. Please try another one.'
            : updatedUsername.error?.message;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: message || 'Error while updating username',
        });
      }
      return true;
    }),
  globalSearch: publicProcedure.mutation(async ({ ctx }) => {
    const items: Record<
      string,
      { title: string; link: string; type: string }[]
    > = {
      Agents: [],
      Prompts: [],
      Tools: [],
    };

    // Helper function to add items to the result
    const addItems = (
      category: string,
      newItems: { title: string; link: string; type: string }[],
    ) => {
      items[category] = newItems;
    };

    // Fetch agents
    const agents = await ctx.supabase
      .from('swarms_cloud_agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (agents.data) {
      addItems(
        'Agents',
        agents.data.map((agent) => ({
          title: agent.name || '',
          link: makeUrl(PUBLIC.AGENT, { id: agent.id }),
          type: 'agent',
        })),
      );
    }

    // Fetch prompts
    const prompts = await ctx.supabase
      .from('swarms_cloud_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (prompts.data) {
      addItems(
        'Prompts',
        prompts.data.map((prompt) => ({
          title: prompt.name || '',
          link: makeUrl(PUBLIC.PROMPT, { id: prompt.id }),
          type: 'prompt',
        })),
      );
    }

    // Fetch tools
    const tools = await ctx.supabase
      .from('swarms_cloud_tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (tools.data) {
      addItems(
        'Tools',
        tools.data.map((tool) => ({
          title: tool.name || '',
          link: makeUrl(PUBLIC.TOOL, { id: tool.id }),
          type: 'tool',
        })),
      );
    }

    // Get reviews for sorting
    const reviews = await ctx.supabase
      .from('swarms_cloud_reviews')
      .select('model_id, model_type, rating')
      .order('created_at', { ascending: false });

    if (reviews.data) {
      const modelRatings: Record<
        string,
        { modelRating: number; reviewLength: number }
      > = {};

      reviews.data.forEach((review) => {
        const key = `${review?.model_id}-${review?.model_type}`;
        if (!modelRatings[key]) {
          modelRatings[key] = { modelRating: 0, reviewLength: 0 };
        }
        modelRatings[key].modelRating += review?.rating || 0;
        modelRatings[key].reviewLength += 1;
      });

      // Sort items based on reviews
      for (const category of ['Agents', 'Prompts']) {
        items[category].sort((a, b) => {
          const aRating = modelRatings[`${a.link.split('/').pop()}-${a.type}`];
          const bRating = modelRatings[`${b.link.split('/').pop()}-${b.type}`];
          const aAvg = aRating ? aRating.modelRating / aRating.reviewLength : 0;
          const bAvg = bRating ? bRating.modelRating / bRating.reviewLength : 0;
          return bAvg - aAvg;
        });
      }
    }

    return { data: items };
  }),

  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, search } = input;

      const calculateAverageRating = (ratings: any[]) => {
        if (!ratings.length) return 0;
        const sum = ratings.reduce(
          (acc, rating) => acc + (rating.rating || 0),
          0,
        );
        return sum / ratings.length;
      };

      const { data: reviews } = await ctx.supabase
        .from('swarms_cloud_reviews')
        .select('model_id, model_type, rating');

      const modelRatings = (reviews || []).reduce(
        (acc, review) => {
          const key = `${review.model_id}-${review.model_type}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(review);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      const [agents, prompts, tools] = await Promise.all([
        ctx.supabase
          .from('swarms_cloud_agents')
          .select('*')
          .ilike('name', `%${search || ''}%`),

        ctx.supabase
          .from('swarms_cloud_prompts')
          .select('*')
          .ilike('name', `%${search || ''}%`),

        ctx.supabase
          .from('swarms_cloud_tools')
          .select('*')
          .ilike('name', `%${search || ''}%`),
      ]);

      const allModels = [
        ...(agents.data || []).map((agent) => ({
          ...agent,
          type: 'agent',
          link: makeUrl(PUBLIC.AGENT, { id: agent.id }),
        })),
        ...(prompts.data || []).map((prompt) => ({
          ...prompt,
          type: 'prompt',
          link: makeUrl(PUBLIC.PROMPT, { id: prompt.id }),
        })),
        ...(tools.data || []).map((tool) => ({
          ...tool,
          type: 'tool',
          link: makeUrl(PUBLIC.TOOL, { id: tool.id }),
        })),
      ].map((model) => ({
        ...model,
        averageRating: calculateAverageRating(
          modelRatings[`${model.id}-${model.type}`] || [],
        ),
        reviewCount: (modelRatings[`${model.id}-${model.type}`] || []).length,
      }));

      const sortedModels = allModels.sort((a, b) => {
        if (b.averageRating === a.averageRating) {
          return b.reviewCount - a.reviewCount;
        }
        return b.averageRating - a.averageRating;
      });

      const paginatedModels = sortedModels.slice(offset, offset + limit);

      return {
        data: paginatedModels,
        total: sortedModels.length,
        hasMore: offset + limit < sortedModels.length,
      };
    }),

  getAllHistory: userProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
        sortBy: z
          .enum(['created_at', 'updated_at'])
          .optional()
          .default('created_at'),
        filterBy: z
          .enum(['all', 'spreadsheet', 'drag_and_drop'])
          .optional()
          .default('all'),
        search: z.string().optional().default(''),
        filterProperty: z
          .enum(['id', 'content', 'created_at', 'updated_at', 'undefined'])
          .optional(),
        filterValue: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id || '';
      let results: any[] = [];
      let totalRecords = 0;

      if (input.filterBy === 'all' || input.filterBy === 'spreadsheet') {
        let query = ctx.supabase
          .from('swarms_spreadsheet_sessions')
          .select('id, task, created_at, updated_at', { count: 'exact' })
          .eq('user_id', user_id)
          .order(input.sortBy, { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        query = applyFilters(query, input);

        const { data: spreadsheets, count, error } = await query;
        if (error) throw error;
        totalRecords += count || 0;

        const formattedSpreadsheets = spreadsheets.map((session) => ({
          id: session.id,
          content: session.task || 'N/A',
          created_at: session.created_at,
          updated_at: session.updated_at,
          type: 'spreadsheet',
        }));

        results = results.concat(formattedSpreadsheets);
      }

      if (input.filterBy === 'all' || input.filterBy === 'drag_and_drop') {
        let query = ctx.supabase
          .from('drag_and_drop_flows')
          .select('id, flow_data, created_at, updated_at', { count: 'exact' })
          .eq('user_id', user_id)
          .order(input.sortBy, { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        query = applyFilters(query, input);

        const { data: flows, count, error } = await query;
        if (error) throw error;
        totalRecords += count || 0;

        const formattedFlows = flows.map((flow) => {
          let content = 'N/A';
          let flowData;

          try {
            flowData =
              typeof flow.flow_data === 'string'
                ? JSON.parse(flow.flow_data)
                : flow.flow_data;
          } catch (error) {
            console.error('Error parsing flow_data:', error);
            flowData = {};
          }

          const nodes = flowData?.nodes || [];
          for (const node of nodes) {
            const { description, systemPrompt, name } = node.data || {};
            if (description) {
              content = description;
              break;
            } else if (systemPrompt) {
              content = systemPrompt;
              break;
            } else if (name) {
              content = name;
              break;
            }
          }

          return {
            id: flow.id,
            content,
            created_at: flow.created_at,
            updated_at: flow.updated_at,
            type: 'drag_and_drop',
          };
        });

        results = results.concat(formattedFlows);
      }

      if (input?.filterProperty === 'content' && input?.filterValue) {
        results = results.filter((item) =>
          item.content
            .toLowerCase()
            .includes(input?.filterValue?.toLowerCase()),
        );
      }

      const hasMore = input.offset + input.limit < totalRecords;

      return {
        results,
        hasMore,
        totalPages: Math.ceil(totalRecords / input.limit),
      };
    }),
});

export default mainRouter;
