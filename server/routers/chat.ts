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
  afterMessageId: z.string().optional(),
});

const conversationSchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean(),
});

const agentSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  model: z.string(),
  chatId: z.string(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().positive().optional(),
  systemPrompt: z.string().optional(),
  isActive: z.boolean().optional(),
  templateId: z.string().optional(),
});

const BUCKET_NAME = 'images';

const chatRouter = router({
  getConversations: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_chat')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

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
        .order('timestamp', {
          referencedTable: 'swarms_cloud_chat_messages',
          ascending: true,
        })
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
          is_active: input.isActive,
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
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        maxLoops: z.number().positive().optional(),
        id: z.string(),
        is_active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      if (input.is_active) {
        await ctx.supabase
          .from('swarms_cloud_chat')
          .update({ is_active: false })
          .eq('user_id', user_id);
      }

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat')
        .update({
          ...(input.name ? { name: input.name } : {}),
          ...(input.description ? { description: input.description } : {}),
          ...(input.maxLoops !== undefined
            ? { max_loops: Number(input.maxLoops) }
            : {}),
          ...(input.is_active !== undefined
            ? { is_active: input.is_active }
            : {}),
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
        afterMessageId: input.message.afterMessageId ?? '',
      });
    }),

  editMessage: userProcedure
    .input(
      z.object({
        messageId: z.string(),
        newContent: z.string(),
        chatId: z.string(),
        replaceAll: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      if (!user_id) {
        throw new Error('User not authenticated');
      }

      const { data: originalMessage, error: messageError } = await ctx.supabase
        .from('swarms_cloud_chat_messages')
        .select('*')
        .eq('id', input.messageId)
        .eq('user_id', user_id)
        .single();

      if (messageError) {
        throw new Error('Failed to find original message or unauthorized');
      }

      const { data: updatedMessage, error: updateError } = await ctx.supabase
        .from('swarms_cloud_chat_messages')
        .update({
          content: JSON.stringify([
            { role: 'user', content: input.newContent },
          ]),
          is_edited: true,
        })
        .eq('id', input.messageId)
        .eq('user_id', user_id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to update message');
      }

      if (input.replaceAll) {
        const { error: deleteError } = await ctx.supabase
          .from('swarms_cloud_chat_messages')
          .delete()
          .eq('chat_id', input.chatId)
          .gt('timestamp', originalMessage.timestamp)
          .neq('id', input.messageId);

        if (deleteError) {
          throw new Error('Failed to clean up subsequent messages');
        }
      } else {
        const { data: nextMessages, error: nextError } = await ctx.supabase
          .from('swarms_cloud_chat_messages')
          .select('*')
          .eq('chat_id', input.chatId)
          .gt('timestamp', originalMessage.timestamp)
          .order('timestamp', { ascending: true })
          .limit(2);

        if (!nextError && nextMessages && nextMessages.length > 0) {
          if (nextMessages[0].role === 'assistant') {
            const { error: deleteResponseError } = await ctx.supabase
              .from('swarms_cloud_chat_messages')
              .delete()
              .eq('id', nextMessages[0].id);

            if (deleteResponseError) {
              throw new Error('Failed to delete immediate response');
            }
          }
        }
      }

      return updatedMessage;
    }),
});

// Agent Router
const agentRouter = router({
  getAgents: userProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_chat_agents')
      .select('*')
      .eq('user_id', user_id)
      .eq('chat_id', input)
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
          model: input.model || 'gpt-4o',
          temperature: input.temperature,
          chat_id: input.chatId,
          max_tokens: input.maxTokens,
          system_prompt: input.systemPrompt,
          is_active: input.isActive,
          template_id: input.templateId,
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

  getAllAgentTemplates: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_chat_agent_templates')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }),

  // Get agent templates with their status for a specific chat
  getAgentTemplatesForChat: userProcedure
    .input(z.string())
    .query(async ({ ctx, input: chatId }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      // Get all templates
      const { data: templates, error: templatesError } = await ctx.supabase
        .from('swarms_cloud_chat_agent_templates')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: true });

      if (templatesError) throw templatesError;

      // Get chat-specific agent instances
      const { data: chatAgents, error: agentsError } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .select('*')
        .eq('user_id', user_id)
        .eq('chat_id', chatId);

      if (agentsError) throw agentsError;

      // Map templates with their status in the current chat
      const templatesWithStatus = templates.map((template) => {
        const chatAgent = chatAgents.find(
          (agent) => agent.template_id === template.id,
        );
        return {
          ...template,
          chatStatus: chatAgent
            ? {
                id: chatAgent.id,
                is_active: chatAgent.is_active,
                is_selected: true,
                // Include any chat-specific overrides
                name: chatAgent.name,
                description: chatAgent.description,
                system_prompt: chatAgent.system_prompt,
                model: chatAgent.model,
                temperature: chatAgent.temperature,
                max_tokens: chatAgent.max_tokens,
              }
            : {
                is_selected: false,
                is_active: false,
              },
        };
      });

      return templatesWithStatus;
    }),

  // Create a new agent template
  createAgentTemplate: userProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        model: z.string().default('gpt-4o'),
        temperature: z.number().default(0.7),
        max_tokens: z.number().default(2048),
        system_prompt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_agent_templates')
        .insert({
          name: input.name,
          description: input.description,
          model: input.model,
          temperature: input.temperature,
          max_tokens: input.max_tokens,
          system_prompt: input.system_prompt,
          user_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  // Add an existing agent template to a chat
  addAgentTemplateToChat: userProcedure
    .input(
      z.object({
        templateId: z.string(),
        chatId: z.string(),
        // Optional overrides for chat-specific settings
        overrides: z
          .object({
            name: z.string().optional(),
            description: z.string().optional(),
            model: z.string().optional(),
            temperature: z.number().optional(),
            max_tokens: z.number().optional(),
            system_prompt: z.string().optional(),
            is_active: z.boolean().default(true),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      // Check if this template is already added to this chat
      const { data: existing, error: checkError } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .select('id')
        .eq('template_id', input.templateId)
        .eq('chat_id', input.chatId)
        .eq('user_id', user_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // If it exists, update it to be active
        const { data, error } = await ctx.supabase
          .from('swarms_cloud_chat_agents')
          .update({
            is_active: true,
            ...input.overrides,
          })
          .eq('id', existing.id)
          .eq('user_id', user_id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Get the template data first
        const { data: template, error: templateError } = await ctx.supabase
          .from('swarms_cloud_chat_agent_templates')
          .select('*')
          .eq('id', input.templateId)
          .eq('user_id', user_id)
          .single();

        if (templateError) throw templateError;

        // Add the agent to the chat
        const { data, error } = await ctx.supabase
          .from('swarms_cloud_chat_agents')
          .insert({
            name: input.overrides?.name || template.name,
            description: input.overrides?.description || template.description,
            model: input.overrides?.model || template.model,
            temperature: input.overrides?.temperature || template.temperature,
            max_tokens: input.overrides?.max_tokens || template.max_tokens,
            system_prompt:
              input.overrides?.system_prompt || template.system_prompt,
            is_active: input.overrides?.is_active ?? true,
            chat_id: input.chatId,
            template_id: input.templateId,
            user_id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    }),

  removeAgentFromChat: userProcedure
    .input(
      z.object({
        templateId: z.string(),
        chatId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .delete()
        .eq('template_id', input.templateId)
        .eq('chat_id', input.chatId)
        .eq('user_id', user_id);

      if (error) throw error;
      return { success: true };
    }),

  updateAgentTemplate: userProcedure
    .input(
      z.object({
        id: z.string(),
        updates: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          model: z.string().optional(),
          temperature: z.number().optional(),
          max_tokens: z.number().optional(),
          system_prompt: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_agent_templates')
        .update(input.updates)
        .eq('id', input.id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
});

// Swarms Config Router
const swarmConfigRouter = router({
  getSwarmConfig: userProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id;
      if (!user_id) throw new Error('User not authenticated');

      const { data: existingConfig, error: fetchError } = await ctx.supabase
        .from('swarms_cloud_chat_swarm_configs')
        .select('id')
        .eq('chat_id', input)
        .eq('user_id', user_id)
        .maybeSingle();

      if (!existingConfig) {
        const { data: newConfig, error: insertError } = await ctx.supabase
          .from('swarms_cloud_chat_swarm_configs')
          .insert({
            chat_id: input,
            architecture: 'ConcurrentWorkflow',
            user_id,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

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
          .eq('id', newConfig.id)
          .single();

        if (error) throw error;
        return data as SwarmConfig;
      }

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
        .eq('id', existingConfig.id)
        .single();

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
  deleteFile: userProcedure
    .input(
      z.object({
        filePath: z.string(),
        chatId: z.string(),
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

      if (!input.filePath.startsWith(`public/${input?.chatId}/`)) {
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
