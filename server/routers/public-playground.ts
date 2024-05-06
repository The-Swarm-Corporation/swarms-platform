import { publicProcedure, router } from '@/app/api/trpc/trpc-router';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import OpenAI from 'openai';
import { z } from 'zod';

const publicPlaygroundRouter = router({
  vlmMessageCompletion: publicProcedure
    .input(
      z.object({
        model: z.string(),
        content: z.string(),
        image_url: z.string(),
        temperature: z.number().optional(),
        top_p: z.number().optional(),
        max_tokens: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx?.session?.data?.session?.user;

      const model = await supabaseAdmin
        .from('swarms_cloud_models')
        .select('*')
        .eq('enabled', true)
        .eq('unique_name', input.model)
        .eq('model_type', 'vision')
        .single();

      console.log('model', input.model, model);

      if (false) {
        // if its login, we use with their playground api key
        // todo: complete this
      } else {
        // free

        // todo: check for rate limits

        //
        const openAi = new OpenAI({
          apiKey:
            'sk-22a52e4fc117dcbc1e938bc464853dd8309987aab967f28db48996360e019a22',
          baseURL: model?.data?.api_endpoint || 'https://api.swarms.world/v1/',
        });
        try {
          const res = await openAi.chat.completions.create({
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: input.content,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: input.image_url,
                    },
                  },
                ],
              },
            ],
            model: input.model,
          });
          if (res) {
            console.log(JSON.stringify(res, null, 2));

            return res.choices[0].message.content;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }),
});

export default publicPlaygroundRouter;
