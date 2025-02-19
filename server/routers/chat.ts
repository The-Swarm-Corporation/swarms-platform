import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { z } from 'zod';

const chatRouter = router({
  getConversations: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_chat_conversations')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw new Error('Failed to fetch conversations');

    return data;
  }),

  // Create a new conversation
  createConversation: userProcedure
    .input(z.object({ name: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_conversations')
        .insert({
          user_id,
          name: input.name,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error('Failed to create conversation');

      return data;
    }),

  // Add a message to a conversation
  addMessage: userProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string(),
        role: z.enum(['user', 'assistant']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';
      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_messages')
        .insert({
          conversation_id: input.conversationId,
          role: input.role,
          content: input.content,
          timestamp: new Date().toISOString(),
          user_id,
        })
        .select()
        .single();

      if (error) throw new Error('Failed to add message');

      return data;
    }),

  // Export conversation as JSON
  exportConversation: userProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';
      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_messages')
        .select('*')
        .eq('conversation_id', input.conversationId)
        .eq('user_id', user_id);

      if (error) throw new Error('Failed to export conversation');

      return JSON.stringify(data, null, 2);
    }),

  deleteConversation: userProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';
      const { error } = await ctx.supabase
        .from('swarms_cloud_chat_conversations')
        .delete()
        .eq('id', input.conversationId)
        .eq('user_id', user_id);

      if (error) throw new Error('Failed to delete conversation');

      return { success: true };
    }),
});

// Agent Router
const agentRouter = router({
  // Get all agents for a user
  getAgents: userProcedure.query(async ({ ctx }) => {
    const user_id = ctx.session.data.user?.id ?? '';

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_chat_agents')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw new Error('Failed to fetch agents');

    return data;
  }),

  // Add an agent
  addAgent: userProcedure
    .input(
      z.object({
        name: z.string().min(3),
        type: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .insert({
          user_id,
          name: input.name,
          type: input.type,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error('Failed to add agent');

      return data;
    }),

  // Update agent details
  updateAgent: userProcedure
    .input(
      z.object({
        agentId: z.string(),
        updates: z.object({
          name: z.string().optional(),
          type: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';
      const { error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .update(input.updates)
        .eq('id', input.agentId)
        .eq('user_id', user_id);

      if (error) throw new Error('Failed to update agent');

      return { success: true };
    }),

  // Remove an agent
  removeAgent: userProcedure
    .input(z.object({ agentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user_id = ctx.session.data.user?.id ?? '';

      const { error } = await ctx.supabase
        .from('swarms_cloud_chat_agents')
        .delete()
        .eq('id', input.agentId)
        .eq('user_id', user_id);

      if (error) throw new Error('Failed to remove agent');

      return { success: true };
    }),
});

// File Router
const fileUploadRouter = router({
  uploadFile: userProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.storage
        .from('uploads')
        .upload(input.fileName, Buffer.from(input.fileData, 'base64'));

      if (error) throw new Error('File upload failed');

      return { url: data?.path };
    }),

  getFileUrl: userProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async ({ctx, input }) => {
      const { publicURL, error } = ctx.supabase.storage
        .from('uploads')
        .getPublicUrl(input.filePath);

      if (error) throw new Error('Failed to get file URL');

      return { url: publicURL };
    }),
});

export { chatRouter, agentRouter, fileUploadRouter };