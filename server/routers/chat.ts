import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { SwarmConfig } from '@/shared/components/chat/types';
import { addMessage } from '@/shared/utils/api/swarms/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.any(),
  timestamp: z.string(),
  imageUrl: z.string().optional(),
  agentId: z.string().optional(),
});

const conversationSchema = z.object({
  name: z.string().min(1),
});

const agentSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().positive().optional(),
  systemPrompt: z.string().optional(),
  isActive: z.boolean().optional(),
});

const BUCKET_NAME = 'swarms_cloud_chat_file';

const chatRouter = router({
  getConversations: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_chat')
      .select('*')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });

    if (error) throw new Error('Failed to fetch conversations');

    return data;
  }),

  getConversation: userProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat')
        .select(
          `
          *,
          messages:swarms_cloud_chat_messages(*)
        `,
        )
        .eq('id', input)
        .eq('user_id', user_id)
        .single();

      if (error) throw error;
      return data;
    }),

  createConversation: userProcedure
    .input(conversationSchema)
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat')
        .insert({
          name: input.name,
          user_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  updateConversation: userProcedure
    .input(
      z.object({
        name: z.string().min(1),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log({ input });
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat')
        .update({
          name: input.name,
        })
        .eq('id', input.id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  deleteConversation: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { error } = await ctx.supabase
        .from('swarms_cloud_chat')
        .delete()
        .eq('id', input)
        .eq('user_id', user_id);

      if (error) throw error;
    }),

  addMessage: userProcedure
    .input(
      z.object({
        conversationId: z.string(),
        message: messageSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      if (!user_id) {
        throw new Error('User not authenticated');
      }

      return await addMessage({
        chatId: input.conversationId,
        role: input.message.role,
        content: input.message.content,
        timestamp: input.message.timestamp,
        supabase: ctx.supabase,
        userId: user_id,
        imageUrl: input.message.imageUrl ?? '',
        agentId: input.message.agentId ?? '',
      });
    }),
});

// Agent Router
const agentRouter = router({
  getAgents: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_chat_agents')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }),

  addAgent: userProcedure
    .input(agentSchema)
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .insert({
          name: input.name,
          description: input.description,
          model: input.model,
          temperature: input.temperature,
          max_tokens: input.maxTokens,
          system_prompt: input.systemPrompt,
          is_active: input.isActive,
          user_id,
        })
        .select()
        .single();

      console.error(error);
      if (error) throw error;
      return data;
    }),

  updateAgent: userProcedure
    .input(
      z.object({
        id: z.string(),
        updates: agentSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .update({
          name: input.updates.name,
          description: input.updates.description,
          model: input.updates.model,
          temperature: input.updates.temperature,
          max_tokens: input.updates.maxTokens,
          system_prompt: input.updates.systemPrompt,
        })
        .eq('id', input.id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  removeAgent: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .delete()
        .eq('id', input)
        .eq('user_id', user_id);

      if (error) throw error;
    }),

  toggleAgent: userProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data: agent, error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .select('is_active')
        .eq('id', input.id)
        .eq('user_id', user_id)
        .single();

      if (error || !agent) {
        throw new Error('Agent not found.');
      }

      const newStatus = !agent.is_active;

      const { error: updateError } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .update({ is_active: newStatus })
        .eq('id', input.id)
        .eq('user_id', user_id);

      if (updateError) {
        throw new Error('Failed to update agent status.');
      }

      return { success: true, is_active: newStatus };
    }),
});

// Swarms Config Router
const swarmConfigRouter = router({
  getSwarmConfig: userProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id;
      if (!user_id) throw new Error('User not authenticated');

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_swarm_configs')
        .select(
          `
          *,
          agents:swarms_cloud_chat_swarm_agents(
            swarm_config_id,
            agent_id,
            position,
            agent:swarms_cloud_chat_agents(*)
          )
        `,
        )
        .eq('chat_id', input)
        .eq('user_id', user_id)
        .single();

      console.log({ swarm_config: error });
      if (error) throw error;
      return data as SwarmConfig;
    }),

  updateSwarmConfig: userProcedure
    .input(
      z.object({
        chatId: z.string(),
        architecture: z.enum([
          'auto',
          'AgentRearrange',
          'MixtureOfAgents',
          'SpreadSheetSwarm',
          'SequentialWorkflow',
          'ConcurrentWorkflow',
          'GroupChat',
          'MultiAgentRouter',
          'AutoSwarmBuilder',
          'HiearchicalSwarm',
          'MajorityVoting',
        ]),
        agentIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id;
      if (!user_id) throw new Error('User not authenticated');

      // Start transaction
      const { data: existingConfig, error: fetchError } = await ctx.supabase
        .from('swarms_cloud_chat_swarm_configs')
        .select('id')
        .eq('chat_id', input.chatId)
        .eq('user_id', user_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      // Create or update config
      const configPromise = existingConfig
        ? ctx.supabase
            .from('swarms_cloud_chat_swarm_configs')
            .update({ architecture: input.architecture })
            .eq('id', existingConfig.id)
            .select()
        : ctx.supabase
            .from('swarms_cloud_chat_swarm_configs')
            .insert({
              chat_id: input.chatId,
              architecture: input.architecture,
              user_id,
            })
            .select();

      const { data: configData, error: configError } = await configPromise;
      if (configError) throw configError;

      const configId = existingConfig?.id || configData[0].id;

      // Delete existing agent associations
      const { error: deleteError } = await ctx.supabase
        .from('swarms_cloud_chat_swarm_agents')
        .delete()
        .eq('swarm_config_id', configId)
        .eq('user_id', user_id);

      if (deleteError) throw deleteError;

      // Create new agent associations
      if (input.agentIds.length > 0) {
        const { error: insertError } = await ctx.supabase
          .from('swarms_cloud_chat_swarm_agents')
          .insert(
            input.agentIds.map((agentId, index) => ({
              swarm_config_id: configId,
              agent_id: agentId,
              position: index,
              user_id,
            })),
          );

        if (insertError) throw insertError;
      }

      // Return updated config with agents
      return ctx.supabase
        .from('swarms_cloud_chat_swarm_configs')
        .select(
          `
          *,
          agents:swarms_cloud_chat_swarm_agents(
            swarm_config_id,
            agent_id,
            position,
            agent:swarms_cloud_chat_agents(*)
          )
        `,
        )
        .eq('id', configId)
        .single();
    }),
});

// File Router
const fileUploadRouter = router({
  uploadFile: userProcedure
    .input(
      z.object({
        file: z.instanceof(File),
        chatId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
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

      const filePath = `${userId}/${input.chatId}/${input.fileName}`;

      try {
        const { error: storageError } = await ctx.supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, input.file, {
            contentType: input.fileType,
            upsert: true,
          });

        if (storageError) {
          throw storageError;
        }

        const { data: urlData } = ctx.supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        return {
          publicUrl: urlData.publicUrl,
          filePath,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload file',
          cause: error,
        });
      }
    }),

  deleteFile: userProcedure
    .input(
      z.object({
        filePath: z.string(),
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

      if (!input.filePath.startsWith(`${userId}/`)) {
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
});

export { chatRouter, agentRouter, fileUploadRouter, swarmConfigRouter };
